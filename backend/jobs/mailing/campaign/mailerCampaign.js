module.exports = function(db, logger, configuration, filters) {

    let mailer = require('../../../components/mailer.js')(db, logger, configuration);
    let titleize = require('underscore.string/titleize');
    let launchTime = new Date().getTime();

    let cursor = db.collection('trainee').find({
        'sourceIDF': null,
        'mailSent': false,
        'unsubscribe': false,
        'training.organisation.siret': { $ne: '' },
        'training.scheduledEndDate': { $lte: new Date() },
        ...(filters.campaign ? { 'campaign': filters.campaign } : {}),
    }).limit(configuration.app.mailer.limit);

    cursor.count(function(err, count) {
        logger.info('Mailer campaign - launch');
        let stream = cursor.stream();

        stream.on('data', function(trainee) {
            let options = {
                to: trainee.trainee.email
            };
            trainee.trainee.firstName = titleize(trainee.trainee.firstName);
            trainee.trainee.name = titleize(trainee.trainee.name);
            mailer.sendVotreAvisMail(options, trainee, function() {
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
                db.collection('trainee').update({ '_id': trainee._id }, {
                    $set: {
                        'mailSent': true,
                        'mailError': 'smtpError',
                        'mailErrorDetail': err
                    }
                });
            });
        });

        // TODO: use promise array to be sure that every emails are sent !
        stream.on('end', function() {
            let endTime = new Date().getTime();
            logger.info('Mailer campaign - completed (' + count + ' emails, ' + (endTime - launchTime) + 'ms)');
        });
    });
};
