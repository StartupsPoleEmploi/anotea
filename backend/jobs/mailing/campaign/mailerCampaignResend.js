module.exports = function(db, logger, configuration) {

    const mailer = require('../../../components/mailer.js')(db, logger, configuration);

    const launchTime = new Date().getTime();
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - configuration.smtp.relaunchDelay);

    let cursor = db.collection('trainee').find({
        mailSent: true,
        unsubscribe: false,
        tracking: { $eq: null },
        mailSentDate: { $lte: lastWeek.toString() },
        $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(configuration.smtp.maxRelaunch) } }]
    }).limit(configuration.app.mailer.limit);

    cursor.count(function(err, count) {
        logger.info('Mailer campaign resend (emails not open) - launch');
        const stream = cursor.stream();

        stream.on('data', function(trainee) {
            try {
                var options = {
                    to: trainee.trainee.email
                };
            } catch (e) {
                logger.error('Trainee in a dirty state (_id : ' + trainee._id + ') : email not present in MongoDB document');
                db.collection('trainee').update({ '_id': trainee._id }, {
                    $set: {
                        'mailSent': true,
                        'mailError': 'dirtyState'
                    }
                });
                return;
            }
            stream.pause();
            mailer.sendVotreAvisMail(options, trainee, function() {
                stream.resume();
                try {
                    db.collection('trainee').update({ '_id': trainee._id }, {
                        $set: {
                            'mailSent': true,
                            'mailSentDate': new Date()
                        }, $unset: { 'mailError': '', 'mailErrorDetail': '' }
                    });
                } catch (e) {
                    logger.error(e);
                }
            }, function(err) {
                stream.resume();
                db.collection('trainee').update({ '_id': trainee._id }, {
                    $set: {
                        'mailSent': true,
                        'mailError': 'smtpError',
                        'mailErrorDetail': err
                    }
                });
            });
            db.collection('trainee').update({ '_id': trainee._id }, { $inc: { 'mailRetry': 1 } });
        });

        // TODO: use promise array to be sure that every emails are sent !
        stream.on('end', function() {
            const endTime = new Date().getTime();
            logger.info('Mailer campaign resend (emails not open) - completed (' + count + ' emails, ' + (endTime - launchTime) + 'ms)');
        });
    });
};
