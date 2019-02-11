const _ = require('lodash');
const convertToExposableAvis = require('./convertToExposableAvis');

module.exports = action => {
    let dto = _.cloneDeep(action);

    dto.id = dto._id;
    delete dto._id;

    if (dto.avis) {
        dto.avis = dto.avis.map(c => convertToExposableAvis(c));
    }

    if (action.meta && action.formation) {
        dto.meta.source = {
            numero_formation: action.formation.numero,
            numero_action: action.numero,
            type: dto.meta.source,
        };
    }

    return _.pick(dto, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
};
