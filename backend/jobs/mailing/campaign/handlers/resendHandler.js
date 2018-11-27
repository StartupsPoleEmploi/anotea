const moment = require('moment');

module.exports = (db, configuration) => {

    return {
        getQuery: filters => {
            let { relaunchDelay, maxRelaunch } = configuration.smtp.stagiaires;
            let activeRegions = configuration.app.active_regions
            .filter(region => region.jobs.send === true)
            .map(region => region.code_region);

            return {
                mailSent: true,
                unsubscribe: false,
                tracking: { $eq: null },
                mailSentDate: { $lte: moment().subtract(relaunchDelay, 'days').toDate() },
                ...(filters.codeRegion ? { codeRegion: filters.codeRegion } : { codeRegion: { $in: activeRegions } }),
                ...(filters.campaign ? { campaign: filters.campaign } : {}),
                $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(maxRelaunch) } }]
            };
        },
        onSuccess: trainee => {
            return db.collection('trainee').updateOne({ '_id': trainee._id }, {
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
        },
        onError: (err, trainee) => {
            return db.collection('trainee').updateOne({ '_id': trainee._id }, {
                $set: {
                    'mailSent': true,
                    'mailError': 'smtpError',
                    'mailErrorDetail': err
                }
            });
        },
    };
};
