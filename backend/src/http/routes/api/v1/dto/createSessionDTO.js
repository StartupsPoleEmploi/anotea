const _ = require('lodash');
const createAvisDTO = require('./createAvisDTO');
const createScoreDTO = require('./createScoreDTO');

module.exports = session => {
    let dto = _.cloneDeep(session);
    dto.id = dto._id;
    delete dto._id;

    if (dto.avis) {
        dto.avis = dto.avis.map(c => createAvisDTO(c));
    }

    if (dto.score) {
        dto.score = createScoreDTO(dto.score);
    }

    return _.pick(dto, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
};
