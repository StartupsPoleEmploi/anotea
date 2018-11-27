let titleize = require('underscore.string/titleize');

module.exports = (db, logger, configuration, mailer, filters) => {

    return new Promise(async (resolve, reject) => {

        let promises = [];
        let stats = {
            total: 0,
            sent: 0,
            error: 0,
        };
        let activeRegions = configuration.app.active_regions
        .filter(region => region.jobs.send === true)
        .map(region => region.code_region);

        let cursor = db.collection('trainee')
        .find({
            'sourceIDF': null,
            'mailSent': false,
            'unsubscribe': false,
            'training.organisation.siret': { $ne: '' },
            'training.scheduledEndDate': { $lte: new Date() },
            ...(filters.codeRegion ? { codeRegion: filters.codeRegion } : { codeRegion: { $in: activeRegions } }),
            ...(filters.campaign ? { 'campaign': filters.campaign } : {}),
        });

        if (filters.limit()) {
            cursor.limit(filters.limit);
        }

        while (await cursor.hasNext()) {
            const trainee = await cursor.next();
            trainee.trainee.firstName = titleize(trainee.trainee.firstName);
            trainee.trainee.name = titleize(trainee.trainee.name);

            promises.push(
                new Promise((resolve, reject) => {
                    mailer.sendVotreAvisMail({ to: trainee.trainee.email }, trainee, () => {
                        db.collection('trainee').update({ '_id': trainee._id }, {
                            $set: {
                                'mailSent': true,
                                'mailSentDate': new Date()
                            }, $unset: { 'mailError': '', 'mailErrorDetail': '' }
                        });
                        stats.sent++;
                        return resolve();
                    }, err => {
                        db.collection('trainee').update({ '_id': trainee._id }, {
                            $set: {
                                'mailSent': true,
                                'mailError': 'smtpError',
                                'mailErrorDetail': err
                            }
                        });
                        logger.error(err);
                        stats.error++;
                        return reject();
                    });
                })
            );
        }

        await Promise.all(promises);
        return stats.error === 0 ? resolve(stats) : reject(stats);
    });
};
