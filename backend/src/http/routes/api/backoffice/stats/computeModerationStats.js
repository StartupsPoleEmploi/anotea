module.exports = async (db, query) => {
    let results = await db.collection('comment').aggregate([
        {
            $match: {
                ...query,
            }
        },
        {
            $group:
                {
                    _id: null,
                    sumReported: {
                        $sum: {
                            $cond: { if: { $eq: ['$reported', true] }, then: 1, else: 0 },
                        }
                    },
                    sumStatusNone: {
                        $sum: {
                            $cond: { if: { $eq: ['$moderated', false] }, then: 1, else: 0 },
                        }
                    },
                    sumReponseStatusNone: {
                        $sum: {
                            $cond: { if: { $eq: ['$reponse.status', 'none'] }, then: 1, else: 0 },
                        }
                    },
                }
        },
        {
            $project: {
                _id: 0,
                none: '$sumStatusNone',
                reported: '$sumReported',
                reponse: {
                    none: '$sumReponseStatusNone',
                }
            }
        }
    ]).toArray();

    return results[0] || {};
};
