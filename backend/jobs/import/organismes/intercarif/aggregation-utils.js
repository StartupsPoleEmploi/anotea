module.exports = {
    computeScoreOperators: () => {
        return [
            {
                $lookup: {
                    from: 'comment',
                    let: {
                        siret: '$siret',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $gte: ['$step', 2] },
                                        { $eq: ['$training.organisation.siret', '$$siret'] },
                                    ]
                                },
                                $or: [
                                    { 'comment': { $exists: false } },
                                    { 'comment': null },
                                    { 'published': true }
                                ]
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                accueil: { $avg: '$rates.accueil' },
                                contenu_formation: { $avg: '$rates.contenu_formation' },
                                equipe_formateurs: { $avg: '$rates.equipe_formateurs' },
                                moyen_materiel: { $avg: '$rates.moyen_materiel' },
                                accompagnement: { $avg: '$rates.accompagnement' },
                                global: { $avg: '$rates.global' },
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                nb_avis: '$count',
                                notes: {
                                    accueil: { $ceil: '$accueil' },
                                    contenu_formation: { $ceil: '$contenu_formation' },
                                    equipe_formateurs: { $ceil: '$equipe_formateurs' },
                                    moyen_materiel: { $ceil: '$moyen_materiel' },
                                    accompagnement: { $ceil: '$accompagnement' },
                                    global: { $ceil: '$global' }
                                },
                            }
                        }],
                    as: 'score'
                }
            },
            {
                $unwind: {
                    path: '$score', preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    score: { $ifNull: ['$score', { nb_avis: 0 }] },
                }
            },
        ];
    }
};
