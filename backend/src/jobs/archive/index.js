#!/usr/bin/env node
'use strict';
const moment = require('moment');
const cli = require('commander');
const { execute, batchCursor } = require('../job-utils');

cli.description('Adding archived flag to old avis')
.parse(process.argv);

execute(async ({ db, logger }) => {

    logger.info(`Adding flag 'archived' to old avis...`);
    let stats = {
        archived: 0,
    };

    let cursor = db.collection('comment')
    .find({
        'training.scheduledEndDate': {
            $lte: new Date(moment().subtract(24, 'months').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
        }
    });

    await batchCursor(cursor, async next => {
        const comment = await next();
        let res = await db.collection('comment').updateOne({ _id: comment._id }, { $set: { 'archived': true } });
        if (res.result.nModified > 0) {
            stats.archived++;
        }
    });

    return stats;
});
