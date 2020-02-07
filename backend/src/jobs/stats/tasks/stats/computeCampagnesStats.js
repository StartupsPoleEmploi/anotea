module.exports = db => {
    return db.collection('stagiaires').aggregate([
        {
            $group: {
                _id: '$campaign',
                date: { $min: '$mailSentDate' },
                nbStagiairesContactes: { $sum: { $cond: ['$mailSent', 1, 0] } },
                nbMailsOuverts: { $sum: { $cond: ['$tracking.firstRead', 1, 0] } },
                nbLiensCliques: { $sum: { $cond: ['$tracking.click', 1, 0] } }
            }
        },
        {
            $match: {
                //TODO add a limit to ignore campaign older than XX months
                date: { $ne: null },
            }
        },
        {
            $lookup: {
                from: 'avis',
                let: {
                    campaign: '$_id',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$campaign', '$$campaign'] },
                                ]
                            },
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            nbAvis: { $sum: 1 },
                            nbCommentaires: {
                                $sum: {
                                    $cond: {
                                        if: { $not: ['$commentaire'] },
                                        then: 0,
                                        else: 1,
                                    }
                                }
                            },
                        }
                    },
                ],
                as: 'stats'
            }
        },
        {
            $unwind:
                {
                    path: '$stats',
                    preserveNullAndEmptyArrays: true
                }
        },
        {
            $group: {
                _id: '$_id',
                campaign: { $first: '$_id' },
                date: { $first: '$date' },
                nbStagiairesContactes: { $first: '$nbStagiairesContactes' },
                nbMailsOuverts: { $first: '$nbMailsOuverts' },
                nbLiensCliques: { $first: '$nbLiensCliques' },
                nbAvis: { $first: '$stats.nbAvis' },
                nbCommentaires: { $first: '$stats.nbCommentaires' },
            }
        },
        {
            $project: {
                _id: 0,
            }
        },
        {
            $sort: {
                date: -1
            }
        }
    ]).toArray();
};
