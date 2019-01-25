const moment = require('moment');

module.exports = db => {

    const buildStats = async () => {
        const today = new Date();
        const THREE_MONTHS_AGO = moment().subtract('3', 'months').toDate();

        const stats = await db.collection('accounts').aggregate([{
            $match: {
                'profile': 'organisme',
                'codeRegion': { $ne: null }
            }
        }, {
            $lookup: {
                from: 'events',
                localField: 'meta.siretAsString',
                foreignField: 'source.id',
                as: 'events',
            }
        },
        {
            $project: {
                codeRegion: '$codeRegion',
                passwordHash: '$passwordHash',
                nbAvis: '$meta.nbAvis',
                login: {
                    $filter: {
                        input: '$events',
                        as: 'event',
                        cond: {
                            $and: [
                                { $eq: ['$$event.type', 'log in'] },
                                { $gte: ['$$event.date', THREE_MONTHS_AGO] },
                            ]
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    codeRegion: '$codeRegion',
                },
                count: { $sum: 1 },
                countAccountCreated: { $sum: { $cond: ['$passwordHash', 1, 0] } },
                countWithMorethanOneAdvice: { $sum: { $cond: ['$nbAvis', 1, 0] } },
                countLogin: { $sum: { $cond: [{ $size: '$login' }, 1, 0] } }
            }
        }]).toArray();

        stats.forEach(stat => {
            db.collection('organismesStats').updateOne({ _id: { codeRegion: stat._id.codeRegion, year: today.getFullYear(), month: today.getMonth() + 1 }}, { $set: { count: stat.count, countAccountCreated: stat.countAccountCreated, countWithMorethanOneAdvice: stat.countWithMorethanOneAdvice, countLogin: stat.countLogin }}, { upsert: true });
        });
    };

    return {
        buildStats: buildStats
    };
};
