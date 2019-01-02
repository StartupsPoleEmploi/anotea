module.exports = db => {
    return db.collection('intercarif').aggregate([
        {
            $project: {
                _id: 0,
                _attributes: 1,
                _meta: 1,
                actions: 1,
                training: 1,
            }
        },
        {
            $unwind: '$actions'
        },
        {
            $unwind: '$actions.sessions'
        },
        {
            $project: {
                numero_formation: '$_attributes.numero',
                numero_action: '$actions._attributes.numero',
                numero_session: '$actions.sessions._attributes.numero',
                organisme_formateur: '$actions.organisme_formateur.siret_formateur.siret',
                organisme_financeurs: '$actions.organisme_financeurs',
                lieu_de_formation: '$actions.lieu_de_formation.coordonnees.adresse.codepostal',
                region: '$actions.lieu_de_formation.coordonnees.adresse.region',
                certifinfos: '$_meta.certifinfos',
                formacodes: '$_meta.formacodes',
            }
        },
        //Resolving region
        {
            $lookup: {
                from: 'regions',
                localField: 'region',
                foreignField: 'codeINSEE',
                as: 'regions'
            }
        },
        {
            $unwind: { path: '$regions', preserveNullAndEmptyArrays: true }
        },
        //Reconciling comments
        {
            $lookup: {
                from: 'comment',
                let: {
                    organisme_formateur: '$organisme_formateur',
                    lieu_de_formation: '$lieu_de_formation',
                    certifinfos: '$certifinfos',
                    formacodes: '$formacodes'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $gte: ['$step', 2] },
                                    { $eq: ['$training.organisation.siret', '$$organisme_formateur'] },
                                    { $eq: ['$training.place.postalCode', '$$lieu_de_formation'] },
                                    {
                                        $or: [
                                            { $in: ['$training.certifInfo.id', '$$certifinfos'] },
                                            { $in: ['$formacode', '$$formacodes'] }
                                        ]
                                    }
                                ]
                            },
                            $or: [
                                { 'comment': { $exists: false } },
                                { 'comment': null },
                                { 'published': true },
                                { 'rejected': true },
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            comments: { $push: '$$ROOT' },
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
                            _id: 1,
                            comments: 1,
                            score: {
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
                        }
                    }],
                as: 'reconciliation'
            }
        },
        {
            $unwind: { path: '$reconciliation', preserveNullAndEmptyArrays: true }
        },
        //Add score when session has not comments
        {
            $addFields: {
                'reconciliation.score': { $ifNull: ['$reconciliation.score', { nb_avis: 0 }] },
            }
        },
        //Build final session document
        {
            $replaceRoot: {
                newRoot: {
                    _id: { $concat: ['$numero_formation', '|', '$numero_action', '|', '$numero_session'] },
                    numero: '$numero_session',
                    region: '$region',
                    code_region: '$regions.codeRegion',
                    code_financeurs: '$organisme_financeurs.code_financeur',
                    avis: '$reconciliation.comments',
                    score: '$reconciliation.score',
                    meta: {
                        reconciliation: {
                            organisme_formateur: '$organisme_formateur',
                            lieu_de_formation: '$lieu_de_formation',
                            certifinfos: '$certifinfos',
                            formacodes: '$formacodes',
                        },
                        source: {
                            type: 'intercarif',
                            numero_formation: '$numero_formation',
                            numero_action: '$numero_action',
                            numero_session: '$numero_session',
                        },
                    },
                }
            }
        },
        //Ensure session is unique
        {
            $group: {
                _id: '$_id',
                unique: { $first: '$$ROOT' }
            }
        },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ['$unique']
                }
            }
        },
        //Output documents into target collection
        {
            $out: 'sessionsReconciliees'
        }
    ], { allowDiskUse: true }).toArray();
};

