const _ = require('lodash');

module.exports = organisme => {
    let dto = _.cloneDeep(organisme);
    dto.id = dto._id;
    delete dto._id;
    return _.pick(dto, ['id', 'numero', 'siret', 'raison_sociale', 'lieux_de_formation', 'score', 'meta']);
};
