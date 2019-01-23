module.exports = async (db, codeRegion) => {
    let results = await db.collection('comment').aggregate([
        {
            $match: {
                step: { $gte: 2 },
                comment: { $ne: null },
                codeRegion: codeRegion,
            }
        },
        {
            $group:
                {
                    _id: null,
                    reported: {
                        $sum: {
                            $cond: { if: { $eq: ['$reported', true] }, then: 1, else: 0 }
                        }
                    },
                    rejected: {
                        $sum: {
                            $cond: { if: { $eq: ['$rejected', true] }, then: 1, else: 0 }
                        }
                    },
                    published: {
                        $sum: {
                            $cond: { if: { $eq: ['$published', true] }, then: 1, else: 0 }
                        }
                    },
                    toModerate: {
                        $sum: {
                            $cond: { if: { $ne: ['$moderated', true] }, then: 1, else: 0 }
                        }
                    },
                    all: { $sum: 1 },
                }
        },
        {
            $project: {
                _id: 0,
            }
        }
    ]).toArray();

    return results[0] || {};
};
