const buildProjection = require('../utils/buildProjection');
const { createIntercarifDTO } = require('../utils/dto');
const schema = require('../utils/schema');
const { IdNotFoundError } = require('../../../../common/errors');

module.exports = (db, type) => async (parameters, options = {}) => {

    let doc = await db.collection(`${type}sReconciliees`).findOne(
        { _id: parameters.id },
        { projection: buildProjection(parameters.fields) },
    );

    if (!doc) {
        throw new IdNotFoundError(`Numéro ${type} inconnu ou ${type} expirée`);
    }

    return options.jsonLd ? schema.toCourse(doc) :
        createIntercarifDTO(doc, { notes_decimales: parameters.notes_decimales });
};
