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
                certifinfos: '$_meta.certifinfos',
                formacodes: '$_meta.formacodes',
                //FIXME ugly until https://jira.mongodb.org/browse/SERVER-37470 is fixed
                organisme_formateur_siret: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 0] },
                organisme_formateur_siret_1: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 1] },
                organisme_formateur_siret_2: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 2] },
                organisme_formateur_siret_3: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 3] },
                organisme_formateur_siret_4: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 4] },
                organisme_formateur_siret_5: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 5] },
                organisme_formateur_siret_6: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 6] },
                organisme_formateur_siret_7: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 7] },
                organisme_formateur_siret_8: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 8] },
                organisme_formateur_siret_9: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 9] },
                organisme_formateur_siret_10: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 10] },
                organisme_formateur_siret_11: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 11] },
                organisme_formateur_siret_12: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 12] },
                organisme_formateur_siret_13: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 13] },
                organisme_formateur_siret_14: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 14] },
                organisme_formateur_siret_15: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 15] },
                organisme_formateur_siret_16: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 16] },
                organisme_formateur_siret_17: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 17] },
                organisme_formateur_siret_18: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 18] },
                organisme_formateur_siret_19: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 19] },
                organisme_formateur_siret_20: { $arrayElemAt: ['$actions.organisme_formateur.siret_formateur.siret', 20] },
            }
        },
        //Reconciling comments
        {
            $lookup: {
                from: 'comment',
                let: {
                    organisme_formateur_siret: '$organisme_formateur_siret',
                    organisme_formateur_siret_1: '$organisme_formateur_siret_1',
                    organisme_formateur_siret_2: '$organisme_formateur_siret_2',
                    organisme_formateur_siret_3: '$organisme_formateur_siret_3',
                    organisme_formateur_siret_4: '$organisme_formateur_siret_4',
                    organisme_formateur_siret_5: '$organisme_formateur_siret_5',
                    organisme_formateur_siret_6: '$organisme_formateur_siret_6',
                    organisme_formateur_siret_7: '$organisme_formateur_siret_7',
                    organisme_formateur_siret_8: '$organisme_formateur_siret_8',
                    organisme_formateur_siret_9: '$organisme_formateur_siret_9',
                    organisme_formateur_siret_10: '$organisme_formateur_siret_10',
                    organisme_formateur_siret_11: '$organisme_formateur_siret_11',
                    organisme_formateur_siret_12: '$organisme_formateur_siret_12',
                    organisme_formateur_siret_13: '$organisme_formateur_siret_13',
                    organisme_formateur_siret_14: '$organisme_formateur_siret_14',
                    organisme_formateur_siret_15: '$organisme_formateur_siret_15',
                    organisme_formateur_siret_16: '$organisme_formateur_siret_16',
                    organisme_formateur_siret_17: '$organisme_formateur_siret_17',
                    organisme_formateur_siret_18: '$organisme_formateur_siret_18',
                    organisme_formateur_siret_19: '$organisme_formateur_siret_19',
                    organisme_formateur_siret_20: '$organisme_formateur_siret_20',
                    certifinfos: '$certifinfos',
                    formacodes: '$formacodes'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $or: [
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_1'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_2'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_3'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_4'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_5'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_6'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_7'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_8'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_9'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_10'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_11'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_12'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_13'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_14'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_15'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_16'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_17'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_18'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_19'] },
                                            { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret_20'] },
                                        ]
                                    },
                                    {
                                        $or: [
                                            { $in: ['$training.certifInfo.id', '$$certifinfos'] },
                                            { $in: ['$formacode', '$$formacodes'] }
                                        ]
                                    },
                                    {
                                        $or: [
                                            { $eq: ['$comment', null] },
                                            { $eq: ['$published', true] },
                                            { $eq: ['$rejected', true] },
                                        ]
                                    }
                                ]
                            },
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

