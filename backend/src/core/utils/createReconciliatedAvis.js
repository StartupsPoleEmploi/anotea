const _ = require('lodash');

module.exports = data => {
    let training = data.training;

    let avis = {
        id: data._id,
        date: data.date ? data.date : data._id.getTimestamp(),
        notes: data.notes,
        formation: {
            //TODO add organisme responsable data
            numero: training.idFormation,
            intitule: training.title,
            domaine_formation: {
                formacodes: training.formacodes,
            },
            certifications: training.certifInfos.map(code => ({ certif_info: code })),
            action: {
                lieu_de_formation: {
                    code_postal: training.place.postalCode,
                    ville: training.place.city,
                },
                organisme_financeurs: data.codeFinanceur ? [{
                    code_financeur: data.codeFinanceur
                }] : [],
                organisme_formateur: {
                    raison_sociale: training.organisation.name,
                    siret: training.organisation.siret,
                    numero: training.organisation.id,
                },
                session: {
                    numero: data.training.infoCarif.numeroSession,
                    periode: {
                        debut: training.startDate,
                        fin: training.scheduledEndDate,
                    },
                },
            },
        },
    };

    if (training.infoCarif.numeroAction !== 'NULL') {
        avis.formation.action.numero = training.infoCarif.numeroAction;
    }

    if (data.commentaire && data.status === 'validated') {
        avis.commentaire = {
            ...(!_.isEmpty(data.commentaire.text) ? { texte: data.commentaire.text } : {}),
            ...(!_.isEmpty(data.commentaire.title) && !data.commentaire.titleMasked ? { titre: data.commentaire.title } : {}),
        };
    }

    if (data.reponse && data.status === 'validated' && data.reponse.status === 'validated') {
        avis.reponse = {
            texte: data.reponse.text,
        };
    }

    return avis;
};
