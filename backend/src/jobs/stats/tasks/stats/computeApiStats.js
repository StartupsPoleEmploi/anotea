module.exports = async (db, codeRegion) => {

    let codeRegionFilter = codeRegion ? { codeRegion } : {};
    let regionFilter = codeRegion ? { region: codeRegion } : {};
    let avis = db.collection('avis');
    let sessionsReconciliees = db.collection('sessionsReconciliees');

    let [
        nbAvis,
        nbAvisRestituables,
        nbSessions,
        nbSessionsAvecAvis,
        nbSessionsCertifiantesAvecAvis,
        avisPerSession,
    ] = await Promise.all([
        avis.countDocuments({ ...codeRegionFilter }),
        avis.countDocuments({ 'meta.reconciliations.0.reconciliable': true, ...codeRegionFilter }),
        sessionsReconciliees.countDocuments({ ...regionFilter }),
        sessionsReconciliees.countDocuments({ 'score.nb_avis': { $gte: 1 }, ...regionFilter }),
        sessionsReconciliees.countDocuments({
            'score.nb_avis': { $gte: 1 },
            'formation.certifications.0': { $exists: true },
            ...regionFilter,
        }),
        sessionsReconciliees.aggregate([
            {
                $match: {
                    ...regionFilter,
                }
            },
            {
                $group: {
                    _id: null,
                    average: { $avg: '$score.nb_avis' }
                }
            }
        ]).toArray(),
    ]);

    return {
        nbAvis,
        nbAvisRestituables,
        nbSessions,
        nbSessionsAvecAvis,
        nbSessionsCertifiantesAvecAvis,
        nbAvisParSession: avisPerSession[0] ? Number(Math.round(avisPerSession[0].average + 'e1') + 'e-1') : 0,
    };
};
