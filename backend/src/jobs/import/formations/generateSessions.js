const roundNotes = require('./roundNotes');

module.exports = async db => {

    await db.collection('intercarif').aggregate([
        {
            $project: {
                _id: 0,
                _attributes: 1,
                _meta: 1,
                intitule_formation: 1,
                actions: 1,
                organisme_formation_responsable: 1,
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
                intitule_formation: '$intitule_formation',
                numero_action: '$actions._attributes.numero',
                numero_session: '$actions.sessions._attributes.numero',
                organisme_responsable_siret: '$organisme_formation_responsable.siret_organisme_formation.siret',
                organisme_responsable_numero: '$organisme_formation_responsable._attributes.numero',
                organisme_responsable_raison_sociale: '$organisme_formation_responsable.raison_sociale',
                organisme_formateur_siret: '$actions.organisme_formateur.siret_formateur.siret',
                organisme_formateur_numero: '$actions.organisme_formateur._attributes.numero',
                organisme_formateur_raison_sociale: '$actions.organisme_formateur.raison_sociale_formateur',
                organisme_financeurs: '$actions.organisme_financeurs',
                lieu_de_formation: '$actions.lieu_de_formation.coordonnees.adresse.codepostal',
                ville: '$actions.lieu_de_formation.coordonnees.adresse.ville',
                code_insee: '$actions.lieu_de_formation.coordonnees.adresse.region',
                code_region: '$actions.lieu_de_formation.coordonnees.adresse.code_region',
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
                    lieu_de_formation: '$lieu_de_formation',
                    certifinfos: '$certifinfos',
                    formacodes: '$formacodes'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$training.organisation.siret', '$$organisme_formateur_siret'] },
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
                    _id: { $concat: ['$numero_formation', '|', '$numero_action', '|', '$numero_session'] },
                    numero: '$numero_session',
                    region: '$code_insee',
                    code_region: '$code_region',
                    avis: { $ifNull: ['$reconciliation.comments', []] },
                    score: '$reconciliation.score',
                    formation: {
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
                        action: {
                            numero: '$numero_action',
                            lieu_de_formation: {
                                code_postal: '$lieu_de_formation',
                                ville: '$ville',
                            },
                            organisme_financeurs: '$organisme_financeurs.code_financeur',
                            organisme_formateur: {
                                raison_sociale: '$organisme_formateur_raison_sociale',
                                siret: '$organisme_formateur_siret',
                                numero: '$organisme_formateur_numero',
                            },
                        },
                    },
                    meta: {
                        source: {
                            //TODO remove source field in v2
                            numero_formation: '$numero_formation',
                            numero_action: '$numero_action',
                            numero_session: '$numero_session',
                            type: 'intercarif',
                        },
                        reconciliation: {
                            organisme_formateur: '$organisme_formateur_siret',
                            lieu_de_formation: '$lieu_de_formation',
                            certifinfos: '$certifinfos',
                            formacodes: '$formacodes',
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

    await roundNotes(db, 'sessionsReconciliees');

    return { imported: await db.collection('sessionsReconciliees').countDocuments() };
};

