module.exports = (db, logger) => {

    const moment = require('moment');

    const buildStats = async () => {
        logger.info('Build email statistics displayed on financer dashboard - launch');

        let launchTime = new Date().getTime();

        await db.collection('trainee').aggregate([
            { $match: { 'mailSentDate': { $ne: null } } },
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
                    emailOpen: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: { eq: ['$$advice.step', 1] }
                        }
                    },
                    advices: {
                        $filter: {
                            input: '$advices',
                            as: 'advice',
                            cond: {
                                $and: [
                                    { published: true },
                                    { eq: ['$$advice.step', 2] }
                                ]
                            }
                        }
                    },
                    advicesWithComments: {
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
                    },
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$mailSentDate' },
                        month: { $month: '$mailSentDate' },
                        codeRegion: '$codeRegion',
                        codeFinanceur: '$training.codeFinanceur'
                    },
                    count: { $sum: 1 },
                    countOpen: { $sum: { $size: '$emailOpen' } },
                    countAdvices: { $sum: { $size: '$advices' } },
                    countAdvicesWithComments: { $sum: { $size: '$advicesWithComments' } },
                    countAdvicesPositif: { $sum: { $size: '$advicesPositif' } },
                    countAdvicesNegatif: { $sum: { $size: '$advicesNegatif' } },
                    countAdvicesRejected: { $sum: { $size: '$advicesRejected' } }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            },
            { $out: 'mailStats' }
        ]).toArray();

        logger.info(`Build email statistics displayed on financer dashboard - completed (${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
    };

    return {
        buildStats: buildStats
    };
};