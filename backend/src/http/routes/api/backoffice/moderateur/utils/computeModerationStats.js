module.exports = async (db, codeRegion) => {
    let results = await db.collection('comment').aggregate([
        {
            $match: {
                comment: { $ne: null },
                archived: false,
                codeRegion,
            }
        },
        {
            $group:
                {
                    _id: null,
                    sumStatusNone: {
                        $sum: {
                            $cond: { if: { $ne: ['$moderated', true] }, then: 1, else: 0 }
                        }
                    },
                    summStatusReported: {
                        $sum: {
                            $cond: { if: { $eq: ['$reported', true] }, then: 1, else: 0 }
                        }
                    },
                    sumReponseStatusNone: {
                        $sum: {
                            $cond: { if: { $eq: ['$reponse.status', 'none'] }, then: 1, else: 0 }
                        }
                    },
                }
        },
        {
            $project: {
                _id: 0,
                status: {
                    none: '$sumStatusNone',
                    reported: '$summStatusReported',
                },
                reponseStatus: {
                    none: '$sumReponseStatusNone',
                }
            }
        }
    ]).toArray();

    return results[0] || {};
};
