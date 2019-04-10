const createScoreDTO = require('./createScoreDTO');

module.exports = (data, options = {}) => {
    return {
        id: `${data._id}`,
        raison_sociale: data.raisonSociale,
        siret: data.meta ? data.meta.siretAsString : undefined,
        numero: data.numero,
        lieux_de_formation: data.lieux_de_formation,
        score: data.score && createScoreDTO(data.score, options),
    };
};
