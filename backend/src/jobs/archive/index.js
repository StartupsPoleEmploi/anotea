#!/usr/bin/env node
"use strict";
const moment = require("moment");
const cli = require("commander");
const { execute, batchCursor } = require("../job-utils");

cli.description("Archive avis")
.option("--slack", "Send a slack notification when job is finished")
.parse(process.argv);

execute(async ({ db, logger, sendSlackNotification }) => {

    logger.info(`Adding flag 'archived' to old avis...`);
    let stats = {
        archived: 0,
    };

    let cursor = db.collection("comment")
    .find({
        "training.scheduledEndDate": {
            $lte: new Date(moment().subtract(24, "months").format("YYYY-MM-DDTHH:mm:ss.SSSZ"))
        }
    });

    await batchCursor(cursor, async next => {
        const comment = await next();
        let res = await db.collection("comment").updateOne(
            { _id: comment._id },
            { $set: { "status": "archived" } }
        );
        if (res.result.nModified > 0) {
            stats.archived++;
        }
    });

    if (stats.archived > 0) {
        sendSlackNotification({
            text: `[STAGIAIRE] ${stats.archived} stagiaires ont été archivé(s)`,
        });
    }

    return stats;
}, { slack: cli.slack });
