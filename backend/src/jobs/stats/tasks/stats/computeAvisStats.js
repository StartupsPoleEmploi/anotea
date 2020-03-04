module.exports = async (db, codeRegion) => {

    let avis = db.collection('avis');
    let stagiaires = db.collection('stagiaires');
    let filter = codeRegion ? { codeRegion } : {};

    let [
        nbStagiairesImportes,
        nbStagiairesContactes,
        nbRelances,
        nbMailsOuverts,
        nbLiensCliques,
        nbAvis,
        nbAvisAvecCommentaire,
        nbCommentairesAModerer,
        nbCommentairesPositifs,
        nbCommentairesNegatifs,
        nbCommentairesRejetes,
        nbReponses,
    ] = await Promise.all([
        stagiaires.countDocuments({ ...filter }),
        stagiaires.countDocuments({ 'mailSent': true, ...filter }),
        stagiaires.aggregate([
            { $match: { 'mailSent': true, ...filter } },
            {
                $group: {
                    _id: null,
                    mailRetries: { $sum: '$mailRetry' },
                }
            },
        ]).toArray(),
        stagiaires.countDocuments({ 'tracking.firstRead': { $ne: null }, ...filter }),
        stagiaires.countDocuments({ 'tracking.click': { $ne: null }, ...filter }),
        avis.countDocuments({ ...filter }),
        avis.countDocuments({ 'commentaire': { $ne: null }, ...filter }),
        avis.countDocuments({ 'commentaire': { $ne: null }, 'status': 'none', ...filter }),
        avis.countDocuments({ 'commentaire': { $ne: null }, 'qualification': 'positif', ...filter }),
        avis.countDocuments({ 'commentaire': { $ne: null }, 'qualification': 'négatif', ...filter }),
        avis.countDocuments({ 'status': 'rejected', ...filter }),
        avis.countDocuments({ 'reponse': { $exists: true }, ...filter }),
    ]);

    return {
        nbStagiairesImportes,
        nbStagiairesContactes,
        nbMailEnvoyes: nbRelances.length > 0 ? (nbRelances[0].mailRetries + nbStagiairesContactes) : 0,
        nbCommentairesAModerer,
        nbMailsOuverts,
        nbLiensCliques,
        nbAvis,
        nbAvisAvecCommentaire,
        nbCommentairesPositifs,
        nbCommentairesNegatifs,
        nbCommentairesRejetes,
        nbReponses,
    };
};
