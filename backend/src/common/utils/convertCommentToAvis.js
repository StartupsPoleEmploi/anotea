const _ = require('lodash');

const convertCommentaire = data => {

    let commentaire = {};
    if (!_.isEmpty(data.comment.text)) {
        commentaire.texte = data.editedComment ? data.editedComment.text : data.comment.text;
    }

    if (!_.isEmpty(data.comment.title) && !data.titleMasked) {
        commentaire.titre = data.comment.title;
    }

    if (data.reponse && data.reponse.status === 'published') {
        commentaire.reponse = data.reponse.text;
    }

    return commentaire;
};

module.exports = data => {
    let training = data.training;
    let rates = data.rates;

    let avis = {
        id: data._id,
        date: data.date ? data.date : data._id.getTimestamp(),
        notes: {
            accueil: rates.accueil,
            contenu_formation: rates.contenu_formation,
            equipe_formateurs: rates.equipe_formateurs,
            moyen_materiel: rates.moyen_materiel,
            accompagnement: rates.accompagnement,
            global: rates.global,
        },
        formation: {
            //TODO add organisme responsable data
            numero: training.idFormation,
            intitule: training.title,
            domaine_formation: {
                formacodes: [data.formacode],
            },
            certifications: [
                { certif_info: training.certifInfo.id }
            ].filter(c => !_.isEmpty(c.certif_info)),
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

    if (!data.pseudoMasked && !data.rejected && !_.isEmpty(data.pseudo)) {
        avis.pseudo = data.pseudo;
    }

    if (data.comment && !data.rejected) {
        avis.commentaire = convertCommentaire(data);
    }

    return avis;
};
