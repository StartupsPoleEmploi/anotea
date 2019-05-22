module.exports = (db, regions) => {

    let { findActiveRegions } = regions;

    let computeRegionalAvisStats = async (regionName, codeRegions) => {

        let avis = db.collection('comment');

        let [nbAvis, formation, action, session] = await Promise.all([
            avis.countDocuments({ 'codeRegion': { $in: codeRegions } }),
            avis.countDocuments({ 'codeRegion': { $in: codeRegions }, 'meta.reconciliation.formation': true }),
            avis.countDocuments({ 'codeRegion': { $in: codeRegions }, 'meta.reconciliation.action': true }),
            avis.countDocuments({ 'codeRegion': { $in: codeRegions }, 'meta.reconciliation.session': true }),
        ]);

        return {
            region: regionName,
            nbAvis,
            avisRestitutables: {
                'apiRouteFormations': `${Math.ceil((formation * 100) / nbAvis)}%`,
                'apiRouteActions': `${Math.ceil((action * 100) / nbAvis)}%`,
                'apiRouteSessions': `${Math.ceil((session * 100) / nbAvis)}%`,
            },
        };
    };

    let computeRegionalSessionStats = async (regionName, codeRegions) => {

        let sessionsReconciliees = db.collection('sessionsReconciliees');

        let [nbSessions, nbSessionsAvecAuMoinsUnAvis, nbSessionsAuMoinsTroisAvis] = await Promise.all([
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions } }),
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions }, 'score.nb_avis': { $gte: 1 } }),
            sessionsReconciliees.countDocuments({ 'code_region': { $in: codeRegions }, 'score.nb_avis': { $gte: 3 } }),
        ]);

        return {
            region: regionName,
            nbSessions,
            sessionsAvecAuMoinsUnAvis: `${Math.ceil((nbSessionsAvecAuMoinsUnAvis * 100) / nbSessions)}%`,
            sessionsAvecAuMoinsTroisAvis: `${Math.ceil((nbSessionsAuMoinsTroisAvis * 100) / nbSessions)}%`,
        };
    };

    let computeRegionalOrganismesStats = async (regionName, codeRegions) => {

        let organismes = db.collection('accounts');

        let [nbOrganimes, nbOrganismesAvecAvis, nbOrganismesActifs] = await Promise.all([
            organismes.countDocuments({
                'profile': 'organisme',
                'codeRegion': { $in: codeRegions },
            }),
            organismes.countDocuments({
                'profile': 'organisme',
                'score.nb_avis': { $gte: 1 },
                'codeRegion': { $in: codeRegions },
            }),
            organismes.countDocuments({
                'profile': 'organisme',
                'passwordHash': { $ne: null },
                'codeRegion': { $in: codeRegions },
            }),
        ]);

        return {
            region: regionName,
            nbOrganimes,
            nbOrganismesActifs,
            nbOrganismesAvecAvis,
            organismesAvecAuMoinsUnAvis: `${Math.ceil((nbOrganismesAvecAvis * 100) / nbOrganimes)}%`,
        };
    };

    let computeKairosStats = async () => {
        let [nbOrganismes, actifs, hasAtLeastOneAvis] = await Promise.all([
            db.collection('accounts').count({
                'profile': 'organisme',
                'sources': { $in: ['kairos'] }
            }),
            db.collection('accounts').count({
                'profile': 'organisme',
                'passwordHash': { $exists: true },
                'sources': { $in: ['kairos'] }
            }),
            db.collection('accounts').count({
                'profile': 'organisme',
                'score.nb_avis': { $gt: 0 },
                'sources': { $in: ['kairos'] }
            }),
        ]);

        return { nbOrganismes, actifs, hasAtLeastOneAvis };
    };

    return {
        computeKairosStats: () => {
            return computeKairosStats();
        },
        computeOrganismesStats: async () => {

            let regions = findActiveRegions();
            return Promise.all([
                computeRegionalOrganismesStats('Toutes', regions.map(region => region.codeRegion)),
                ...regions.map(async region => computeRegionalOrganismesStats(region.nom, [region.codeRegion])),
            ]);
        },
        computeAvisStats: () => {
            let regions = findActiveRegions();
            return Promise.all([
                computeRegionalAvisStats('Toutes', regions.map(region => region.codeRegion)),
                ...regions.map(async region => computeRegionalAvisStats(region.nom, [region.codeRegion]))
            ]);
        },
        computeSessionsStats: () => {
            let regions = findActiveRegions();
            return Promise.all([
                computeRegionalSessionStats('Toutes', regions.map(region => region.codeRegion)),
                ...regions.map(async region => computeRegionalSessionStats(region.nom, [region.codeRegion]))
            ]);
        },
        computeFormationsStats: async () => {

            let formationsReconciliees = db.collection('formationsReconciliees');

            let [nbFormations, nbFormationAvecAuMoinsUnAvis, nbSessionsAuMoinsTroisAvis] = await Promise.all([
                formationsReconciliees.countDocuments({}),
                formationsReconciliees.countDocuments({ 'score.nb_avis': { $gte: 1 } }),
                formationsReconciliees.countDocuments({ 'score.nb_avis': { $gte: 3 } }),
            ]);

            return {
                nbFormations,
                formationsAvecAuMoinsUnAvis: `${Math.ceil((nbFormationAvecAuMoinsUnAvis * 100) / nbFormations)}%`,
                formationsAvecAuMoinsTroisAvis: `${Math.ceil((nbSessionsAuMoinsTroisAvis * 100) / nbFormations)}%`,
            };
        },
        computeMailingStats: (codeRegion, codeFinanceur) => {

            return db.collection('trainee').aggregate([
                {
                    $match: {
                        ...(codeRegion ? { codeRegion: codeRegion } : {}),
                        ...(codeFinanceur ? { 'training.codeFinanceur': { $elemMatch: { $eq: codeFinanceur } } } : {})
                    }
                },
                {
                    $group: {
                        _id: '$campaign',
                        date: { $min: '$mailSentDate' },
                        mailSent: { $sum: { $cond: ['$mailSent', 1, 0] } },
                        mailOpen: { $sum: { $cond: ['$tracking.firstRead', 1, 0] } },
                        linkClick: { $sum: { $cond: ['$tracking.click', 1, 0] } }
                    }
                },
                {
                    $lookup: {
                        from: 'comment',
                        let: {
                            campaign: '$_id',
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$campaign', '$$campaign'] },
                                            //hack to return a valid expression when codeRegion is empty
                                            codeRegion ? { $eq: ['$codeRegion', codeRegion] } : { $eq: ['$campaign', '$$campaign'] },
                                        ]
                                    },
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    nbAvis: { $sum: 1 },
                                    nbCommentaires: {
                                        $sum: {
                                            $cond: {
                                                if: { $not: ['$comment'] },
                                                then: 0,
                                                else: 1,
                                            }
                                        }
                                    },
                                    nbCommentairesRejected: {
                                        $sum: {
                                            $cond: {
                                                if: { $eq: ['$rejected', true] },
                                                then: 1,
                                                else: 0,
                                            }
                                        }
                                    },
                                    allowToContact: {
                                        $sum: {
                                            $cond: {
                                                if: { $eq: ['$accord', true] },
                                                then: 1,
                                                else: 0
                                            }
                                        }
                                    },
                                }
                            },
                        ],
                        as: 'stats'
                    }
                },
                {
                    $unwind:
                        {
                            path: '$stats',
                            preserveNullAndEmptyArrays: true
                        }
                },
                {
                    $group: {
                        _id: '$_id',
                        date: { $first: '$date' },
                        mailSent: { $first: '$mailSent' },
                        mailOpen: { $first: '$mailOpen' },
                        linkClick: { $first: '$linkClick' },
                        formValidated: { $first: '$stats.nbAvis' },
                        allowToContact: { $first: '$stats.allowToContact' },
                        nbCommentaires: { $first: '$stats.nbCommentaires' },
                        nbCommentairesRejected: { $first: '$stats.nbCommentairesRejected' },
                    }
                },
                {
                    $sort: {
                        date: -1
                    }
                }
            ]).toArray();
        }
    };
};
