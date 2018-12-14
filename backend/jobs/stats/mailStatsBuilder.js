module.exports = (db, logger) => {

    const moment = require('moment');

    const buildStats = async () => {
        logger.info('Build email statistics displayed on financer dashboard - launch');

        let launchTime = new Date().getTime();

        await db.collection('trainee').aggregate([
            { $match: { 'mailSentDate': { $gt: new Date(2018,9,9) } } }, // $ne : null
            { $unwind: '$training.codeFinanceur' },
            {
                $lookup: {
                    from: 'comment',
                    localField: 'token',
                    foreignField: 'token',
                    as: 'advices',
                }
            },
            {
                $project: {
                    mailSentDate: '$mailSentDate',
                    codeRegion: '$codeRegion',
                    codeFinanceur: '$training.codeFinanceur',
                    count: { '$size': '$advices' },
                    emailOpen: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: { $gte: ['$$advice.step', 1] }
                        }
                    },
                    advicesPublished: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: { $gte: ['$$advice.step', 2] } // TODO : published
                        }
                    }
                }
            },
            {
                $project: {
                    mailSentDate: '$mailSentDate',
                    codeRegion: '$codeRegion',
                    codeFinanceur: '$codeFinanceur',
                    count: '$count',
                    countEmailOpen: {
                        '$size': '$emailOpen'
                    },
                    countAdvicesPublished: {
                        '$size': '$advicesPublished'
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$mailSentDate' },
                        month: { $month: '$mailSentDate' },
                        codeRegion: '$codeRegion',
                        codeFinanceur: '$codeFinanceur'
                    },
                    count: { $sum: '$count' },
                    countEmailOpen: { $sum: '$countEmailOpen' },
                    countAdvicesPublished: { $sum: '$countAdvicesPublished' }
                },
            } /*,{ $project: {
                mailSentDate: '$mailSentDate',
                codeRegion: '$codeRegion',
                codeFinanceur: '$training.codeFinanceur',
                count: '$count',
                emailOpen: {
                    $filter: {
                        input: '$advices',
                        as: 'advice',
                        cond: { eq: ['$$advice.step', 1] }
                    }
                }
            } }*/, {
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            { $out: 'mailStats' }
        ], { allowDiskUse: true }).toArray();/*, {
                $project: {
                    mailSentDate: '$mailSentDate',
                    codeRegion: '$codeRegion',
                    codeFinanceur: '$training.codeFinanceur',
                    advices: '$advices',
                    emailOpen: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: { eq: ['$$advice.step', 1] }
                        }
                    },
                    advicesPublished: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: { eq: ['$$advice.step', 2] }
                        }
                    },
                }},
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                },
                { $out: 'mailStats' }
            ]).toArray();

                   /* advicesWithComments: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: {
                                $and: [
                                    { published: true },
                                    { eq: ['$$advice.step', 3] }
                                ]
                            }
                        }
                    },
                    advicesPositif: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: {
                                $and: [
                                    { published: true },
                                    { eq: ['$$advice.step', 3] },
                                    { qualification: 'positif' },
                                ]
                            }
                        }
                    },
                    advicesNegatif: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: {
                                $and: [
                                    { published: true },
                                    { eq: ['$$advice.step', 3] },
                                    { qualification: 'négatif' },
                                ]
                            }
                        }
                    },
                    advicesRejected: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: {
                                $and: [
                                    { rejected: true }
                                ]
                            }
                        }
                    },*/
          /*  {
                $group: {
                    _id: {
                        year: { $year: '$mailSentDate' },
                        month: { $month: '$mailSentDate' },
                        codeRegion: '$codeRegion',
                        codeFinanceur: '$codeFinanceur'
                    },
                    count: { $sum: 1 },
                    advices: { $first: '$advices' }
                  /*  countAll: { $sum: { $size: '$advices' } },
                    countOpen: { $sum: { $size: '$emailOpen' } },
                    countAdvices: { $sum: { $size: '$advicesPublished' } },
                    /*countAdvicesWithComments: { $sum: { $size: '$advicesWithComments' } },
                    countAdvicesPositif: { $sum: { $size: '$advicesPositif' } },
                    countAdvicesNegatif: { $sum: { $size: '$advicesNegatif' } },
                    countAdvicesRejected: { $sum: { $size: '$advicesRejected' } }
                }
            },*/

        logger.info(`Build email statistics displayed on financer dashboard - completed (${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
    };

    return {
        buildStats: buildStats
    };
};