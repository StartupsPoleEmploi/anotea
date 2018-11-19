module.exports = function(db, logger, configuration) {

    const mailer = require('../../../components/mailer.js')(db, logger, configuration);

    const launchTime = new Date().getTime();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - configuration.smtp.relaunchDelay);

    const activeRegions = configuration.app.active_regions.filter(region => region.jobs && region.jobs.resend).map(region => region.code_region);

    let cursor = db.collection('trainee').find({
        mailSent: true,
        unsubscribe: false,
        tracking: { $eq: null },
        codeRegion: { $in: activeRegions },
        mailSentDate: { $lte: lastWeek.toString() },
        $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(configuration.smtp.maxRelaunch) } }]
    }).limit(configuration.app.mailer.limit);

    logger.info('Mailer campaign resend (emails not open) - launch');

    cursor.count((err, count) => {
        if (!err) {

            const stream = cursor.stream();

            stream.on('data', trainee => {
                let options = {
                    to: trainee.trainee.email
                };
                stream.pause();
                mailer.sendVotreAvisMail(options, trainee, async () => {
                    stream.resume();
                    try {
                        await db.collection('trainee').update({ '_id': trainee._id }, {
                            $set: {
                                'mailSent': true,
                                'mailSentDate': new Date(),
                            }, $unset: {
                                'mailError': '',
                                'mailErrorDetail': ''
                            }, $inc: {
                                'mailRetry': 1
                            }
                        });
                    } catch (e) {
                        logger.error(e);
                    }
                }, err => {
                    stream.resume();
                    db.collection('trainee').update({ '_id': trainee._id }, {
                        $set: {
                            'mailSent': true,
                            'mailError': 'smtpError',
                            'mailErrorDetail': err
                        }
                    });
                    logger.error(err);
                });
            });

            // TODO: use promise array to be sure that every emails are sent !
            stream.on('end', () => {
                const endTime = new Date().getTime();
                logger.info('Mailer campaign resend (emails not open) - completed (' + count + ' emails, ' + (endTime - launchTime) + 'ms)');
            });
        } else {
            logger.error(err);
        }
    });
};
