#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {

    let [nbSessions, nbSessionAvecAvis, nbAvis, results] = await Promise.all([
        db.collection('sessionsReconciliees').countDocuments({ 'code_region': '11' }),
        db.collection('sessionsReconciliees').countDocuments({ 'code_region': '11', 'score.nb_avis': { $gte: 1 } }),
        db.collection('comment').countDocuments({ codeRegion: '11', step: { $gte: 2 } }),
        db.collection('sessionsReconciliees').aggregate([
            {
                $match: {
                    code_region: '11',
                }
            },
            {
                $unwind: '$avis'
            },
            {
                $group: {
                    _id: '$avis._id',
                }
            },
            {
                $count: 'nbAvisRestituables'
            }
        ]).toArray(),
    ]);

    return {
        nbSessions,
        nbAvis,
        sessionAvecAvis: `${Math.ceil((nbSessionAvecAvis * 100) / nbSessions)}%`,
        avisRestituables: `${Math.ceil((results[0].nbAvisRestituables * 100) / nbAvis)}%`,
    };
});
