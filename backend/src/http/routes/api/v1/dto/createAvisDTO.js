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

module.exports = (data, options = {}) => {
    let training = data.training;
    let rates = data.rates;

    return {
        id: data._id,
        pseudo: (data.pseudoMasked || data.rejected || _.isEmpty(data.pseudo)) ? undefined : data.pseudo,
        date: data.date ? data.date : data._id.getTimestamp(),
        commentaire: convertCommentaire(data),
        notes: createNoteDTO(rates, options),
        formation: {
            numero: training.idFormation,
            intitule: training.title,
            domaine_formation: {
                formacodes: [data.formacode],
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
                organisme_financeurs: data.codeFinanceur ? [{
                    code_financeur: data.codeFinanceur
                }] : [],
                organisme_formateur: {
                    raison_sociale: training.organisation.name,
                    siret: training.organisation.siret,
                    numero: training.organisation.id,
                },
                session: {
                    numero: data.idSession, //FIXME avis.idSession training.infoCarif.numeroSession ?
                    periode: {
                        debut: training.startDate,
                        fin: training.scheduledEndDate,
                    },
                },
            },
        },
    };
};
