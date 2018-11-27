module.exports = (db, configuration) => {

    return {
        getQuery: filters => {
            let activeRegions = configuration.app.active_regions
            .filter(region => region.jobs.send === true)
            .map(region => region.code_region);

            return {
                'sourceIDF': null,
                'mailSent': false,
                'unsubscribe': false,
                'training.organisation.siret': { $ne: '' },
                'training.scheduledEndDate': { $lte: new Date() },
                ...(filters.codeRegion ? { codeRegion: filters.codeRegion } : { codeRegion: { $in: activeRegions } }),
                ...(filters.campaign ? { 'campaign': filters.campaign } : {}),
            };
        },
        onSuccess: trainee => {
            return db.collection('trainee').updateOne({ '_id': trainee._id }, {
                $set: {
                    'mailSent': true,
                    'mailSentDate': new Date()
                }, $unset: { 'mailError': '', 'mailErrorDetail': '' }
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
