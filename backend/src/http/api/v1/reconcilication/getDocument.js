const buildProjection = require('../utils/buildProjection');
const { createIntercarifDTO } = require('../utils/dto');
const schema = require('../utils/schema');
const { IdNotFoundError } = require('../../../../core/errors');

module.exports = (db, type) => async (parameters, options = {}) => {

    let doc = await db.collection(`${type}sReconciliees`).findOne(
        { _id: parameters.id },
        { projection: buildProjection(parameters.fields) },
    );

    if (doc?.sessions) {
        for (sess in doc.sessions) {
            if (sess.avis) {
                for (data in sess.avis) {
                    if (data.commentaire && data.status === 'validated') {
                        dto.commentaire = {
                            ...(!_.isEmpty(data.commentaire.text) ? { texte: data.commentaire.text } : {}),
                            ...(!_.isEmpty(data.commentaire.title) && !data.commentaire.titleMasked ?
                                { titre: data.commentaire.title } :
                                {}),
                        };
                    } else {
                        delete dto.commentaire;
                    }
                
                    if (data.reponse && data.status === 'validated' && data.reponse.status === 'validated') {
                        dto.reponse = {
                            texte: data.reponse.text,
                        };
                    } else {
                        delete dto.reponse;
                    }
                }
            }
        }
    }

    if (!doc) {
        throw new IdNotFoundError(`Numéro ${type} inconnu ou ${type} expirée`);
    }

    return options.jsonLd ? schema.toCourse(doc) :
        createIntercarifDTO(doc, { notes_decimales: parameters.notes_decimales });
};
