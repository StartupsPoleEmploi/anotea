const buildProjection = require('../../../http/routes/api/v1/utils/buildProjection');
const { createIntercarifDTO } = require('../../../http/routes/api/v1/utils/dto');
const schema = require('../../../http/routes/api/v1/utils/schema');
const { IdNotFoundError } = require('../../errors');

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
