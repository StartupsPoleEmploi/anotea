#!/usr/bin/env node
'use strict';
const moment = require('moment');
const cli = require('commander');
const { execute, batchCursor } = require('../job-utils');

cli.description('Archive avis')
.option('--slack', 'Send a slack notification when job is finished')
.parse(process.argv);

execute(async ({ db, logger, sendSlackNotification }) => {

    logger.info(`Adding flag 'archived' to old avis...`);
    let stats = {
        archived: 0,
        stagiaireArchived: 0,
    };

    let cursor = db.collection('avis')
    .find({
        'formation.action.session.periode.fin': {
            $lte: new Date(moment().subtract(24, 'months').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
        }
    });

    await batchCursor(cursor, async next => {
        const avis = await next();
        let res = await db.collection('avis').updateOne(
            { _id: avis._id },
            { $set: { 'status': 'archived' } }
        );
        let resStagiaire = await db.collection('stagiaires').updateOne(
            { token: avis.token },
            { $unset: { individu: 1 } }
        );
        if (res.result.nModified > 0) {
            stats.archived++;
        }
        if (resStagiaire.result.nModified > 0) {
            stats.stagiaireArchived++;
        }
    });

    if (stats.archived > 0) {
        sendSlackNotification({
            text: `[AVIS] ${stats.archived} avis ont été archivé(s) ; [STAGIARIES] ${stats.stagiaireArchived} stagiaires ont été archivé(s)`,
        });
    }

    return stats;
}, { slack: cli.slack });
