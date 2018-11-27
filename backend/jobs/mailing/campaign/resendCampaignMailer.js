const moment = require('moment');
let titleize = require('underscore.string/titleize');

module.exports = function(db, logger, configuration, mailer, filters) {

    return new Promise(async (resolve, reject) => {

        let { relaunchDelay, maxRelaunch } = configuration.smtp.stagiaires;
        let promises = [];
        let stats = {
            total: 0,
            sent: 0,
            error: 0,
        };
        let activeRegions = configuration.app.active_regions
        .filter(region => region.jobs.resend === true)
        .map(region => region.code_region);

        let cursor = db.collection('trainee')
        .find({
            mailSent: true,
            unsubscribe: false,
            tracking: { $eq: null },
            mailSentDate: { $lte: moment().subtract(relaunchDelay, 'days').toDate() },
            ...(filters.codeRegion ? { codeRegion: filters.codeRegion } : { codeRegion: { $in: activeRegions } }),
            ...(filters.campaign ? { campaign: filters.campaign } : {}),
            $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(maxRelaunch) } }]
        }).limit(configuration.app.mailer.limit);

        while (await cursor.hasNext()) {
            const trainee = await cursor.next();
            trainee.trainee.firstName = titleize(trainee.trainee.firstName);
            trainee.trainee.name = titleize(trainee.trainee.name);

            promises.push(
                new Promise((resolve, reject) => {
                    mailer.sendVotreAvisMail({ to: trainee.trainee.email }, trainee, () => {
                        db.collection('trainee').updateOne({ '_id': trainee._id }, {
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
                        stats.sent++;
                        return resolve();
                    }, err => {
                        db.collection('trainee').updateOne({ '_id': trainee._id }, {
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
                }));
        }

        await Promise.all(promises);
        return stats.error === 0 ? resolve(stats) : reject(stats);
    });
};
