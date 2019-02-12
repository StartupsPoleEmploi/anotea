module.exports = (db, codeRegion) => {
    return {
        computeStats: async () => {
            let results = await db.collection('comment').aggregate([
                {
                    $match: {
                        step: { $gte: 2 },
                        comment: { $ne: null },
                        codeRegion,
                    }
                },
                {
                    $group:
                        {
                            _id: null,
                            aggStatusNone: {
                                $sum: {
                                    $cond: { if: { $ne: ['$moderated', true] }, then: 1, else: 0 }
                                }
                            },
                            aggStatusReported: {
                                $sum: {
                                    $cond: { if: { $eq: ['$reported', true] }, then: 1, else: 0 }
                                }
                            },
                            aggReponseStatusNone: {
                                $sum: {
                                    $cond: { if: { $eq: ['$answer.status', 'none'] }, then: 1, else: 0 }
                                }
                            },
                        }
                },
                {
                    $project: {
                        _id: 0,
                        status: {
                            none: '$aggStatusNone',
                            reported: '$aggStatusReported',
                        },
                        reponseStatus: {
                            none: '$aggReponseStatusNone',
                        }
                    }
                }
            ]).toArray();

            return results[0] || {};
        },
    };
};
