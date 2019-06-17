module.exports = (db, logger) => {

    const buildStats = async () => {
        logger.info('Building email open statistics by domain name');

        return db.collection('trainee').aggregate([
            {
                $group: {
                    _id: { domain: '$trainee.mailDomain', campaign: '$campaign' },
                    count: { $sum: 1 },
                    mailOpen: {
                        $sum: { $cond: ['$tracking.firstRead', 1, 0] }
                    }
                }
            },
            {
                $match:
                    { count: { $gte: 5 } }
            },
            {
                $project: {
                    count: 1,
                    mailOpen: 1,
                    rate: { $divide: ['$mailOpen', '$count'] }
                }
            },
            {
                $sort:
                    { count: -1 }
            },
            { $out: 'domainMailStats' }
        ]).toArray();
    };

    return {
        buildStats: buildStats
    };
};

