module.exports = organisme => {
    return {
        id: `${organisme._id}`,
        raison_sociale: organisme.raisonSociale,
        siret: organisme.meta ? organisme.meta.siretAsString : undefined,
        numero: organisme.numero,
        lieux_de_formation: organisme.lieux_de_formation,
        score: organisme.score
    };
};
