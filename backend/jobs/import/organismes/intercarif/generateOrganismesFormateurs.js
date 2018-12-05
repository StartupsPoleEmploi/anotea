module.exports = async db => {
    await db.collection('organismes_responsables').aggregate([
        {
            $project: {
                _id: 0,
                organisme_formateurs: 1,
            }
        },
        {
            $unwind: '$organisme_formateurs'
        },
        //Remove organisme formateur with same SIRET
        {
            $group: {
                _id: '$organisme_formateurs.siret',
                unique: { $first: '$$ROOT' }
            }
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ['$unique.organisme_formateurs']
                }
            }
        },
        //Compute score
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
                _id: '$siret',
                score: { $ifNull: ['$score', { nb_avis: 0 }] },
            }
        },
        {
            $out: 'organismes_formateurs'
        }
    ], { allowDiskUse: true }).toArray();

    return Promise.all([
        db.collection('organismes_formateurs').createIndex({ 'siret': 1 }, { unique: true }),
        db.collection('organismes_formateurs').createIndex({ 'numero': 1 }),
        db.collection('organismes_formateurs').createIndex({ 'score.nb_avis': 1 }),
    ]);
};


