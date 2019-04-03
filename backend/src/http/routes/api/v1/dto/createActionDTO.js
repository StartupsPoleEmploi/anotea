const _ = require('lodash');
const createAvisDTO = require('./createAvisDTO');
const createScoreDTO = require('./createScoreDTO');

module.exports = (data, options = {}) => {
    let json = _.cloneDeep(data);

    json.id = json._id;
    delete json._id;

    if (json.avis) {
        json.avis = json.avis.map(c => createAvisDTO(c, options));
    }

    if (json.score) {
        json.score = createScoreDTO(json.score, options);
    }

    return _.pick(json, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
};
