const _ = require('lodash');
const convertToExposableAvis = require('./convertToExposableAvis');
const ScoreDTO = require('./ScoreDTO');

module.exports = doc => {
    let json = _.cloneDeep(doc);
    json.id = json._id;
    delete json._id;

    if (json.avis) {
        json.avis = json.avis.map(c => convertToExposableAvis(c));
    }

    if (json.score) {
        json.score = new ScoreDTO(json.score);
    }

    return _.pick(json, ['id', 'numero', 'score', 'avis', 'meta']);
};
