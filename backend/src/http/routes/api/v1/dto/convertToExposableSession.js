const _ = require('lodash');
const convertToExposableAvis = require('./convertToExposableAvis');
const ScoreDTO = require('./ScoreDTO');

module.exports = session => {
    let dto = _.cloneDeep(session);
    dto.id = dto._id;
    delete dto._id;

    if (dto.avis) {
        dto.avis = dto.avis.map(c => convertToExposableAvis(c));
    }

    if (dto.score) {
        dto.score = new ScoreDTO(dto.score);
    }

    return _.pick(dto, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
};
