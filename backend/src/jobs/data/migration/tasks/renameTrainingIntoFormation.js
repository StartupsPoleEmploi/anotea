const { batchCursor } = require('../../../job-utils');
const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {

    let update = async collectionName => {
        let updated = 0;
        let cursor = db.collection(collectionName).find({});

        await batchCursor(cursor, async next => {
            let data = await next();
            let training = data.training;

            let numeroAction = data.sourceIDF ? training.infoRegion.idActionFormation : training.infoCarif.numeroAction;
            let idSession = training.idSession;
            let numeroSession = training.infoCarif.numeroSession;
            let results = await db.collection(collectionName).updateOne({ _id: data._id }, {
                $set: {
                    formation: {
                        numero: training.idFormation,
                        intitule: training.title,
                        domaine_formation: {
                            formacodes: training.formacodes,
                        },
                        certifications: training.certifInfos.map(c => ({ certif_info: c })),
                        action: {
                            ...(numeroAction && numeroAction !== 'NULL' ? { numero: numeroAction } : {}),
                            lieu_de_formation: {
                                code_postal: training.place.postalCode,
                                ville: training.place.city,
                            },
                            organisme_financeurs: training.codeFinanceur.map(c => ({ code_financeur: c })),
                            organisme_formateur: {
                                raison_sociale: training.organisation.name,
                                label: training.organisation.label,
                                siret: training.organisation.siret,
                                numero: training.organisation.id,
                            },
                            session: {
                                ...(idSession && idSession !== 'NULL' ? { id: idSession } : {}),
                                ...(numeroSession && numeroSession !== 'NULL' ? { numero: numeroSession } : {}),
                                periode: {
                                    debut: training.startDate,
                                    fin: training.scheduledEndDate,
                                },
                            },
                        },
                    },
                },
                $unset: {
                    training: 1,
                }
            });

            let nbModified = getNbModifiedDocuments(results);
            if (nbModified > 0) {
                updated += nbModified;
            }
        }, { batchSize: 100 });

        return updated;
    };

    return Promise.all([
        update('stagiaires'),
        update('avis'),
    ]);
};
