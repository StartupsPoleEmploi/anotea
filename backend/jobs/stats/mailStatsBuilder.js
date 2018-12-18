module.exports = db => {

    const buildStats = async option => {
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
                        cond: {
                            $or: [{
                                $and: [
                                    { $eq: ['$$advice.published', true] },
                                    { $eq: ['$$advice.step', 3] }
                                ]
                            }, { $eq: ['$$advice.step', 2] }]
                        }
                    }
                }, advicesWithComments: {
                    $filter: {
                        input: '$advices',
                        as: 'advice',
                        cond: {
                            $and: [
                                { $eq: ['$$advice.published', true] },
                                { $eq: ['$$advice.step', 3] }
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
                                { $eq: ['$$advice.published', true] },
                                { $eq: ['$$advice.step', 3] },
                                { $eq: ['$$advice.qualification', 'positif'] },
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
                                { $eq: ['$$advice.published', true] },
                                { $eq: ['$$advice.step', 3] },
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
                countEmailOpen: {
                    '$size': '$emailOpen'
                },
                countAdvicesPublished: {
                    '$size': '$advicesPublished'
                },
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
                countEmailOpen: { $sum: '$countEmailOpen' },
                countAdvicesPublished: { $sum: '$countAdvicesPublished' },
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