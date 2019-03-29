const roundNotes = require('./roundNotes');

module.exports = async db => {

    await db.collection('intercarif').aggregate([
        {
            $project: {
                _id: 0,
                numero_formation: '$_attributes.numero',
                intitule_formation: '$intitule_formation',
                organisme_responsable_siret: '$organisme_formation_responsable.siret_organisme_formation.siret',
                organisme_responsable_numero: '$organisme_formation_responsable._attributes.numero',
                organisme_responsable_raison_sociale: '$organisme_formation_responsable.raison_sociale',
                //Use only first element until https://jira.mongodb.org/browse/SERVER-37470 fixed
                organisme_formateur_siret: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 0] },
                certifinfos: '$_meta.certifinfos',
                formacodes: '$_meta.formacodes',
            }
        },
        //Reconciling comments
        {
            $lookup: {
                from: 'comment',
                let: {
                    organisme_formateur_siret: '$organisme_formateur_siret',
                    certifinfos: '$certifinfos',
                    formacodes: '$formacodes'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret'] },
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
                                    accueil: { $avg: '$accueil' },
                                    contenu_formation: { $avg: '$contenu_formation' },
                                    equipe_formateurs: { $avg: '$equipe_formateurs' },
                                    moyen_materiel: { $avg: '$moyen_materiel' },
                                    accompagnement: { $avg: '$accompagnement' },
                                    global: { $avg: '$global' }
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
                    _id: { $concat: ['$numero_formation'] },
                    numero: '$numero_formation',
                    intitule: '$intitule_formation',
                    domaine_formation: {
                        formacodes: '$formacodes',
                    },
                    certifications: {
                        certifinfos: '$certifinfos',
                    },
                    organisme_responsable: {
                        raison_sociale: '$organisme_responsable_raison_sociale',
                        siret: '$organisme_responsable_siret',
                        numero: '$organisme_responsable_numero',
                    },
                    avis: { $ifNull: ['$reconciliation.comments', []] },
                    score: '$reconciliation.score',
                    meta: {
                        source: {
                            //TODO remove source field in v2
                            numero_formation: '$numero_formation',
                            type: 'intercarif',
                        },
                        reconciliation: {
                            organisme_formateur: '$organisme_formateur_siret',
                            certifinfos: '$certifinfos',
                            formacodes: '$formacodes',
                        },
                    },
                }
            }
        },
        //Ensure formation is unique
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
            $out: 'formationsReconciliees'
        }
    ], { allowDiskUse: true }).toArray();

    await roundNotes(db, 'formationsReconciliees');

    return { imported: await db.collection('formationsReconciliees').countDocuments() };
};

