module.exports = async (db, codeRegion) => {

    let filter = codeRegion ? { codeRegion } : {};
    let filterSnakeCase = codeRegion ? { code_region: codeRegion } : {};
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
        avis.countDocuments({ ...filter }),
        avis.countDocuments({ 'meta.reconciliations.0.reconciliable': true, ...filter }),
        sessionsReconciliees.countDocuments({ ...filterSnakeCase }),
        sessionsReconciliees.countDocuments({ 'score.nb_avis': { $gte: 1 }, ...filterSnakeCase }),
        sessionsReconciliees.countDocuments({
            'score.nb_avis': { $gte: 1 },
            'formation.certifications.0': { $exists: true },
            ...filterSnakeCase,
        }),
        sessionsReconciliees.aggregate([
            {
                $match: {
                    ...filterSnakeCase,
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
