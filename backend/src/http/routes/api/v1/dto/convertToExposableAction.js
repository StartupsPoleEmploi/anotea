const _ = require('lodash');
const convertToExposableAvis = require('./convertToExposableAvis');

module.exports = action => {
    let dto = _.cloneDeep(action);

    dto.id = dto._id;
    delete dto._id;

    if (dto.avis) {
        dto.avis = dto.avis.map(c => convertToExposableAvis(c));
    }

    return _.pick(dto, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
};
