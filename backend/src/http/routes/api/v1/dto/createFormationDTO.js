const _ = require('lodash');
const createAvisDTO = require('./createAvisDTO');
const createScoreDTO = require('./createScoreDTO');

module.exports = doc => {
    let json = _.cloneDeep(doc);
    json.id = json._id;
    delete json._id;

    if (json.avis) {
        json.avis = json.avis.map(c => createAvisDTO(c));
    }

    if (json.score) {
        json.score = createScoreDTO(json.score);
    }

    return _.pick(json, ['id', 'numero', 'score', 'avis', 'meta']);
};
