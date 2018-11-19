module.exports = function(db, logger, configuration) {

    const mailer = require('../../../components/mailer.js')(db, logger, configuration);

    const launchTime = new Date().getTime();

    const activeRegions = configuration.app.active_regions.filter(region => region.jobs && region.jobs.resend).map(region => region.code_region);

    const cursor = db.collection('trainee').find({
        mailSent: true,
        unsubscribe: false,
        mailError: { $ne: null },
        codeRegion: { $in: activeRegions },
        $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(configuration.smtp.maxRelaunch) } }]
    }).limit(configuration.app.mailer.limit);

    logger.info('Mailer campaign retry (emails not sent due to smtp error) - launch');

    cursor.count((err, count) => {
        if (!err) {
            const stream = cursor.stream();

            stream.on('data', function(trainee) {
                let options = {
                    to: trainee.trainee.email
                };
                mailer.sendVotreAvisMail(options, trainee, function() {
                    try {
                        db.collection('trainee').update({ '_id': trainee._id }, {
                            $set: {
                                'mailSent': true,
                                'mailSentDate': new Date()
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
                let endTime = new Date().getTime();
                logger.info('Mailer campaign retry (emails not sent due to smtp error) - completed (' + count + ' emails, ' + (endTime - launchTime) + 'ms)');
            });
        }
    });
};
