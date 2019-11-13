const _ = require('lodash');

const convertCommentaire = data => {

    let commentaire = {};
    if (!_.isEmpty(data.comment.text)) {
        commentaire.texte = data.comment.text;
    }

    if (!_.isEmpty(data.comment.title) && !data.comment.titleMasked) {
        commentaire.titre = data.comment.title;
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
                formacodes: [training.formacode],
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

    if (!data.pseudoMasked && data.status !== 'rejected' && !_.isEmpty(data.pseudo)) {
        avis.pseudo = data.pseudo;
    }

    if (data.comment && data.status === 'validated') {
        avis.commentaire = convertCommentaire(data);
    }

    if (data.reponse && data.status === 'validated' && data.reponse.status === 'validated') {
        avis.reponse = {
            texte: data.reponse.text,
        };
    }

    return avis;
};
