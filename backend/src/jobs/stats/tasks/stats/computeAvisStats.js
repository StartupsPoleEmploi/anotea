module.exports = (db, regions) => {

    let { findActiveRegions } = regions;
    let avis = db.collection("comment");
    let trainee = db.collection("trainee");

    const getAvisStats = async (label, codeRegions) => {

        let filter = { codeRegion: { $in: codeRegions } };

        let [
            nbStagiairesImportes,
            nbStagiairesContactes,
            nbRelances,
            nbMailsOuverts,
            nbLiensCliques,
            nbQuestionnairesValidees,
            nbAvisAvecCommentaire,
            nbCommentairesAModerer,
            nbCommentairesPositifs,
            nbCommentairesNegatifs,
            nbCommentairesRejetes
        ] = await Promise.all([
            trainee.countDocuments({ ...filter }),
            trainee.countDocuments({ "mailSent": true, ...filter }),
            db.collection("trainee").aggregate([
                { $match: { "mailSent": true, ...filter } },
                {
                    $group: {
                        _id: null,
                        mailRetries: { $sum: "$mailRetry" },
                    }
                },
            ]).toArray(),
            trainee.countDocuments({ "tracking.firstRead": { $ne: null }, ...filter }),
            trainee.countDocuments({ "tracking.click": { $ne: null }, ...filter }),
            trainee.countDocuments({ "avisCreated": true, ...filter }),
            avis.countDocuments({ "comment": { $ne: null }, ...filter }),
            avis.countDocuments({ "comment": { $ne: null }, "status": "none", ...filter }),
            avis.countDocuments({ "comment": { $ne: null }, "qualification": "positif", ...filter }),
            avis.countDocuments({ "comment": { $ne: null }, "qualification": "négatif", ...filter }),
            avis.countDocuments({ "status": "rejected", ...filter })
        ]);

        return {
            label,
            codeRegions,
            nbStagiairesImportes,
            nbStagiairesContactes,
            nbMailEnvoyes: nbRelances.length > 0 ? (nbRelances[0].mailRetries + nbStagiairesContactes) : 0,
            nbCommentairesAModerer,
            nbMailsOuverts,
            nbLiensCliques,
            nbQuestionnairesValidees,
            nbAvisAvecCommentaire,
            nbCommentairesPositifs,
            nbCommentairesNegatifs,
            nbCommentairesRejetes,
        };
    };

    let activeRegions = findActiveRegions();
    return Promise.all([
        getAvisStats("Toutes", activeRegions.map(region => region.codeRegion)),
        ...activeRegions.map(region => getAvisStats(region.nom, [region.codeRegion])),
    ]);
};
