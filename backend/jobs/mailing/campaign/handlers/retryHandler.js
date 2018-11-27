module.exports = (db, configuration) => {

    return {
        getQuery: filters => {
            let activeRegions = configuration.app.active_regions
            .filter(region => region.jobs.send === true)
            .map(region => region.code_region);

            return {
                mailSent: true,
                unsubscribe: false,
                mailError: { $ne: null },
                ...(filters.codeRegion ? { codeRegion: filters.codeRegion } : { codeRegion: { $in: activeRegions } }),
                ...(filters.campaign ? { campaign: filters.campaign } : {}),
                $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(configuration.smtp.maxRelaunch) } }]
            };
        },
        onSuccess: trainee => {
            return db.collection('trainee').updateOne({ '_id': trainee._id }, {
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
