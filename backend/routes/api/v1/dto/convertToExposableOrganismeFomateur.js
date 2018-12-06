module.exports = organisme => {
    return {
        id: `${organisme._id}`,
        raison_sociale: organisme.raisonSociale,
        siret: organisme.meta.siretAsString,
        numero: organisme.meta.numero,
        lieux_de_formation: organisme.meta.lieux_de_formation,
        score: organisme.meta.score
    };
};
