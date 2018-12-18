#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const moment = require('moment');
const createMongoDBClient = require('../../common/createMongoDBClient');
const createLogger = require('../../common/createLogger');
const fixData = require('./fixData');

const doUnescapeHTMLAndStripTags = async db => {
    let promises = [];
    const comment = db.collection('comment');

    let cursor = await comment.find({ comment: { $ne: null } });
    while (await cursor.hasNext()) {
        let advice = await cursor.next();
        if (advice.pseudo) {
            advice.pseudo = fixData(advice.pseudo);
        }
        advice.comment.title = fixData(advice.comment.title);
        advice.comment.text = fixData(advice.comment.text);

        promises.push(comment.updateOne({ _id: advice._id }, { $set: { pseudo: advice.pseudo, comment: advice.comment } }));
    }

    return Promise.all(promises);
};

cli.description('Remove escaped HTML content and strip tags from advice comment (user input)');

const main = async () => {
    let client = await createMongoDBClient(configuration.mongodb.uri);
    let logger = createLogger('anotea-sanitize-advices', configuration);
    let db = client.db();

    try {
        let launchTime = new Date().getTime();
        logger.info(`Launch...`);
        await doUnescapeHTMLAndStripTags(db);
        await client.close();
        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`);
    } catch (e) {
        logger.error(e);
    }
};

main();
