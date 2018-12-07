module.exports = async db => {
    await db.collection('intercarif').aggregate([
        {
            $project: {
                organisme_responsable: {
                    numero: '$organisme_formation_responsable._attributes.numero',
                    siret: '$organisme_formation_responsable.siret_organisme_formation.siret',
                    nom: '$organisme_formation_responsable.nom_organisme',
                    raison_sociale: '$organisme_formation_responsable.raison_sociale',
                    adresse: {
                        code_postal: '$organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse.codepostal',
                        ville: '$organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse.ville',
                        region: '$organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse.region',
                    },
                    courriel: {
                        $ifNull: [
                            '$organisme_formation_responsable.coordonnees_organisme.coordonnees.courriel',
                            '$organisme_formation_responsable.contact_organisme.coordonnees.courriel'
                        ]
                    }
                },
                actions: {
                    $map: {
                        input: '$actions',
                        as: 'action',
                        in: {
                            lieu_de_formation: {
                                nom: '$$action.lieu_de_formation.coordonnees.nom',
                                adresse: {
                                    code_postal: '$$action.lieu_de_formation.coordonnees.adresse.codepostal',
                                    ville: '$$action.lieu_de_formation.coordonnees.adresse.ville',
                                    region: '$$action.lieu_de_formation.coordonnees.adresse.region'
                                }
                            },
                            organisme_formateur: {
                                numero: '$$action.organisme_formateur._attributes.numero',
                                siret: '$$action.organisme_formateur.siret_formateur.siret',
                                raison_sociale: '$$action.organisme_formateur.raison_sociale_formateur',
                                courriel: '$$action.organisme_formateur.contact_formateur.coordonnees.courriel'
                            }
                        }
                    }
                }
            }
        },
        {
            $unwind: '$actions'
        },
        {
            $group: {
                _id: {
                    numero: '$organisme_responsable.numero',
                    organisme_formateur_siret: '$actions.organisme_formateur.siret',
                    lieu_de_formation_code_postal: '$actions.lieu_de_formation.adresse.code_postal'
                },
                organisme_responsable: { $first: '$organisme_responsable' },
                organisme_formateur: { $first: '$actions.organisme_formateur' },
                lieu_de_formation: { $first: '$actions.lieu_de_formation' }
            }
        },
        {
            $group: {
                _id: {
                    numero: '$organisme_responsable.numero',
                    organisme_formateur_siret: '$organisme_formateur.siret'
                },
                organisme_responsable: { $first: '$organisme_responsable' },
                organisme_formateur: { $first: '$organisme_formateur' },
                lieux_de_formation: { $push: '$lieu_de_formation' }
            }
        },
        {
            $group: {
                _id: {
                    numero: '$organisme_responsable.numero'
                },
                organisme_responsable: { $first: '$organisme_responsable' },
                organisme_formateurs: {
                    $push: {
                        $mergeObjects: ['$organisme_formateur', { lieux_de_formation: '$lieux_de_formation' }]
                    }
                }
            }
        },
        {
            $replaceRoot: {
                newRoot: { $mergeObjects: ['$organisme_responsable', { organisme_formateurs: '$organisme_formateurs' }] }
            }
        },
        {
            $addFields: {
                _id: '$siret'
            }
        },
        {
            $out: 'intercarif_organismes_responsables'
        }
    ], { allowDiskUse: true }).toArray();

    return db.collection('intercarif_organismes_responsables').countDocuments();
};


