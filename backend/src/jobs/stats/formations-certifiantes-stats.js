#!/usr/bin/env node
'use strict';

const { execute } = require('../job-utils');

execute(async ({ db }) => {
    let [nbFormations, nbFormationsCertifiantes, nbSessions, nbSessionsCertifiantes, nbSessionsCertifiantesAvecAvis] =
        await Promise.all([
            db.collection('intercarif').countDocuments(),
            db.collection('intercarif').countDocuments({ 'certifications.0': { $exists: true } }),
            db.collection('sessionsReconciliees').countDocuments({
                'code_region': { $in: ['11', '17', '2', '18', '7'] }
            }),
            db.collection('sessionsReconciliees').countDocuments({
                'code_region': { $in: ['11', '17', '2', '18', '7'] },
                'meta.reconciliation.certifinfos.0': { $exists: true },
            }),
            db.collection('sessionsReconciliees').countDocuments({
                'code_region': { $in: ['11', '17', '2', '18', '7'] },
                'score.nb_avis': { $gte: 1 },
                'meta.reconciliation.certifinfos.0': { $exists: true },
            }),
        ]);

    let pourcentageDeSessionsCertifiantesAvecAvis = Math.ceil((nbSessionsCertifiantesAvecAvis * 100) / nbSessionsCertifiantes);
    return {
        message: `Pour les régions ouvertes, il y a en tout ${nbSessions} sessions actives dont ${nbSessionsCertifiantes} sessions qui sont certifiantes. Parmi ces sessions certifiantes, il y a ${nbSessionsCertifiantesAvecAvis} sessions qui ont des avis (soit ${pourcentageDeSessionsCertifiantesAvecAvis}%).`,
        intercarif: {
            nbFormations,
            pourcentageDeFormationsCertifiantes: Math.ceil((nbFormationsCertifiantes * 100) / nbFormations),
        },
        anotea: {
            nbSessions,
            pourcentageDeSessionsCertifiantesAvecAvis: pourcentageDeSessionsCertifiantesAvecAvis,
        },
    };
});
