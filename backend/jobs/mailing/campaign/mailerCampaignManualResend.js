module.exports = function(db, logger, configuration) {

    const mailer = require('../../../components/mailer.js')(db, logger, configuration);

    const launchTime = new Date().getTime();

    const cursor = db.collection('trainee').find({
        importDate: { $gte: new Date('2017-12-21T00:00:00.000Z') },
        tracking: { $eq: null },
        $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: 2 } }]
    }).limit(configuration.app.mailer.limit);

    if (configuration.app.env === 'dev') {
        cursor.limit(1);
    }
    cursor.count(function(err, count) {
        logger.info('Mailer campaign manual resend (emails not open) - launch');
        let stream = cursor.stream();

        stream.on('data', function(trainee) {
            let options;
            try {
                options = {
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
            logger.info('Mailer campaign manual resend (emails not open) - completed (' + count + ' emails, ' + (endTime - launchTime) + 'ms)');
        });
    });
};
