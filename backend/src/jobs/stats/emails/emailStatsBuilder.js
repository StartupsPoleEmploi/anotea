module.exports = (db, logger) => {

    const buildStats = async option => {
        logger.info(`Building email statistics displayed on financer dashboard (${option.unwind ? 'by code financeur' : 'with aggregated financeur code'})`);

        const request = [{ $match: { 'mailSentDate': { $ne: null } } }];
        let codeFinancerProject;
        let outCollection;
        if (option.unwind) {
            request.push({ $unwind: '$training.codeFinanceur' });
            codeFinancerProject = '$training.codeFinanceur';
            outCollection = 'mailStatsByCodeFinanceur';
        } else {
            codeFinancerProject = 'all';
            outCollection = 'mailStats';
        }

        [{
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
                codeFinanceur: codeFinancerProject,
                count: { '$sum': 1 },
                emailOpen: {
                    $sum: { $cond: ['$tracking', 1, 0] }
                },
                countAdvices: {
                    $sum: { '$size': '$advices' },
                },
                advicesWithComments: {
                    $filter: {
                        input: '$advices',
                        as: 'advice',
                        cond: { $or: [
                            { $eq: ['$$advice.published', true] },
                            { $eq: ['$$advice.rejected', true] },
                        ] }
                    }
                },
                advicesPositif: {
                    $filter: {
                        input: '$advices',
                        as: 'advice',
                        cond: {
                            $or: [
                                {
                                    $and: [
                                        { $eq: ['$$advice.published', true] },
                                        { $eq: ['$$advice.qualification', 'positif'] },
                                    ]
                                },
                                {
                                    $and: [
                                        { $eq: ['$$advice.published', true] },
                                        { $eq: ['$$advice.qualification', 'neutre'] },
                                    ]
                                }]
                        }
                    }
                },
                advicesNegatif: {
                    $filter: {
                        input: '$advices',
                        as: 'advice',
                        cond: {
                            $and: [
                                { $eq: ['$$advice.published', true] },
                                { $eq: ['$$advice.qualification', 'négatif'] },
                            ]
                        }
                    }
                },
                advicesRejected: {
                    $filter: {
                        input: '$advices',
                        as: 'advice',
                        cond: { $eq: ['$$advice.rejected', true] }
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
                emailOpen: '$emailOpen',
                countAdvices: '$countAdvices',
                countAdvicesWithComments: {
                    '$size': '$advicesWithComments'
                },
                countAdvicesPositif: {
                    '$size': '$advicesPositif'
                },
                countAdvicesNegatif: {
                    '$size': '$advicesNegatif'
                },
                countAdvicesRejected: {
                    '$size': '$advicesRejected'
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
                countEmailOpen: { $sum: '$emailOpen' },
                countAdvices: { $sum: '$countAdvices' },
                countAdvicesWithComments: { $sum: '$countAdvicesWithComments' },
                countAdvicesPositif: { $sum: '$countAdvicesPositif' },
                countAdvicesNegatif: { $sum: '$countAdvicesNegatif' },
                countAdvicesRejected: { $sum: '$countAdvicesRejected' }
            },
        }, {
            $sort: { '_id.year': 1, '_id.month': 1 }
        },
        { $out: outCollection }].forEach(item => {
            request.push(item);
        });

        await db.collection('trainee').aggregate(request, { allowDiskUse: true }).toArray();
    };

    return {
        buildStats: buildStats
    };
};
