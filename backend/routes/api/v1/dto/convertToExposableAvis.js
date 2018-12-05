const _ = require('lodash');

module.exports = comment => {
    let training = comment.training;
    let rates = comment.rates;

    return {
        id: comment._id,
        pseudo: comment.pseudo,
        date: comment.date ? comment.date : comment._id.getTimestamp(),
        commentaire: comment.comment ? {
            titre: comment.comment.title,
            texte: comment.comment.text,
            reponse: comment.answered ? comment.answer : undefined,
        } : undefined,
        notes: {
            accueil: rates.accueil,
            contenu_formation: rates.contenu_formation,
            equipe_formateurs: rates.equipe_formateurs,
            moyen_materiel: rates.moyen_materiel,
            accompagnement: rates.accompagnement,
            global: rates.global,
        },
        formation: {
            numero: training.idFormation,
            intitule: training.title,
            domaine_formation: {
                formacodes: [comment.formacode],
            },
            certifications: [{
                certif_info: training.certifInfo.id,
            }].filter(c => !_.isEmpty(c.certif_info)),
            action: {
                numero: training.infoCarif.numeroAction !== 'NULL' ? training.infoCarif.numeroAction : undefined,
                lieu_de_formation: {
                    code_postal: training.place.postalCode,
                    ville: training.place.city,
                },
                organisme_financeurs: comment.codeFinanceur ? [{
                    code_financeur: comment.codeFinanceur
                }] : [],
                organisme_formateur: {
                    raison_sociale: training.organisation.name,
                    siret: training.organisation.siret,
                    numero: training.organisation.id,
                },
                session: {
                    numero: comment.idSession, //FIXME avis.idSession training.infoCarif.numeroSession ?
                    periode: {
                        debut: training.startDate,
                        fin: training.scheduledEndDate,
                    },
                },
            },
        },
    };
};
