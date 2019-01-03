const moment = require('moment');

module.exports = db => {

    const buildStats = async () => {
        const today = new Date();
        const THREE_MONTHS_AGO = moment().subtract('3', 'months').toDate();

        const stats = await db.collection('organismes').aggregate([{
            $match: {
                'codeRegion': { $ne: null }
            }
        }, {
            $lookup: {
                from: 'events',
                let: { source: '$source', type: '$type', date: '$date' },
                pipeline: [
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and:
                                    [
                                        { $eq: ['$$source.id', '$id'] }, // TODO : doesn't work
                                        { $eq: ['$$type', 'log in'] },
                                        { $gt: ['$$date', THREE_MONTHS_AGO] }
                                    ]
                            }

                        }
                    }/*,
                    {
                        $group: {
                            _id: '$id'
                        }
                    }*/
                ],
                as: 'events',
            }
        }, {
            $group: {
                _id: {
                    codeRegion: '$codeRegion',
                },
                count: { $sum: 1 },
                countAccountCreated: { $sum: { $cond: ['$passwordHash', 1, 0] } },
                countWithMorethanOneAdvice: { $sum: { $cond: ['$meta.nbAvis', 1, 0] } },
                countLogin: { $sum: { $size: '$events' } }
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