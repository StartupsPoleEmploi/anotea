const _ = require('lodash');
const convertToExposableAvis = require('./convertToExposableAvis');

module.exports = session => {
    let dto = _.cloneDeep(session);
    dto.id = dto._id;
    delete dto._id;

    if (dto.avis) {
        dto.avis = dto.avis.map(c => convertToExposableAvis(c));
    }

    if (session.meta && session.formation) {
        dto.meta.source = {
            //TODO remove source field in v2
            numero_formation: session.formation.numero,
            numero_action: session.formation.action.numero,
            numero_session: session.numero,
            type: dto.meta.source,
        };
    }

    return _.pick(dto, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
};
