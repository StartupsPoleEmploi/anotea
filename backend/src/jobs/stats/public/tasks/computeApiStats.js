module.exports = (db, regions) => {

    let { findActiveRegions } = regions;

    let getAvisReconciliesStats = async (label, codeRegions) => {

        let avis = db.collection('comment');
        let sessionsReconciliees = db.collection('sessionsReconciliees');

        let [
            nbAvis,
            nbAvisReconcilies,
            nbAvisReconciliesActions,
            nbAvisReconciliesSessions,
            nbSessions,
            nbSessionsAvecAvis,
            nbSessionsCertifiantesAvecAvis,
            avisPerSession,
        ] = await Promise.all([
            avis.countDocuments({ 'codeRegion': { $in: codeRegions } }),
            avis.countDocuments({ 'codeRegion': { $in: codeRegions }, 'meta.reconciliations.0.formation': true }),
            avis.countDocuments({ 'codeRegion': { $in: codeRegions }, 'meta.reconciliations.0.action': true }),
            avis.countDocuments({ 'codeRegion': { $in: codeRegions }, 'meta.reconciliations.0.session': true }),
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions } }),
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions }, 'score.nb_avis': { $gte: 1 } }),
            sessionsReconciliees.countDocuments({
                'code_region': { $in: codeRegions },
                'score.nb_avis': { $gte: 1 },
                'formation.certifications.certifinfos.0': { $exists: true }
            }),
            sessionsReconciliees.aggregate([
                { $match: { 'code_region': { $in: codeRegions } } },
                {
                    $group: {
                        _id: null,
                        average: { $avg: '$score.nb_avis' }
                    }
                }
            ]).toArray(),
        ]);

        return {
            label,
            codeRegions,
            nbAvis,
            nbAvisReconcilies,
            nbAvisReconciliesActions,
            nbAvisReconciliesSessions,
            nbSessions,
            nbSessionsAvecAvis,
            nbSessionsCertifiantesAvecAvis,
            nbAvisParSession: avisPerSession[0] ? Number(Math.round(avisPerSession[0].average + 'e1') + 'e-1') : 0,
        };
    };

    let activeRegions = findActiveRegions();
    return Promise.all([
        getAvisReconciliesStats('Toutes', activeRegions.map(region => region.codeRegion)),
        ...activeRegions.map(async region => getAvisReconciliesStats(region.nom, [region.codeRegion]))
    ]);
};
