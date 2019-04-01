const _ = require('lodash');
const convertToExposableAvis = require('./convertToExposableAvis');

module.exports = doc => {
    let json = _.cloneDeep(doc);
    json.id = json._id;
    delete json._id;

    if (json.avis) {
        json.avis = json.avis.map(c => convertToExposableAvis(c));
    }

    return _.pick(json, ['id', 'numero', 'score', 'avis', 'meta']);
};
