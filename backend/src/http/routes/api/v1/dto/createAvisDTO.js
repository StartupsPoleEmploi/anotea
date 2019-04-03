const _ = require('lodash');
const createNoteDTO = require('./createNoteDTO');

const convertCommentaire = comment => {
    if (!comment.comment || comment.rejected) {
        return undefined;
    }

    let texte = _.isEmpty(comment.comment.text) ? undefined : comment.comment.text;

    return {
        titre: (comment.titleMasked || _.isEmpty(comment.comment.title)) ? undefined : comment.comment.title,
        texte: comment.editedComment ? comment.editedComment.text : texte,
        reponse: comment.reponse && comment.reponse.status === 'published' ? comment.reponse.text : undefined,
    };
};

module.exports = comment => {
    let training = comment.training;
    let rates = comment.rates;

    return {
        id: comment._id,
        pseudo: (comment.pseudoMasked || comment.rejected || _.isEmpty(comment.pseudo)) ? undefined : comment.pseudo,
        date: comment.date ? comment.date : comment._id.getTimestamp(),
        commentaire: convertCommentaire(comment),
        notes: createNoteDTO(rates),
        formation: {
            numero: training.idFormation,
            intitule: training.title,
            domaine_formation: {
                formacodes: [comment.formacode],
            },
            certifications: [{
                certif_info: training.certifInfo.id,
            }].filter(c => !_.isEmpty(c.certif_info)),
            //TODO add organisme responsbale data
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
