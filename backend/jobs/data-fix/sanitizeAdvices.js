#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const moment = require('moment');

const getLogger = require('../../components/logger');
const s = require('string');
const { sanitize } = require('../../components/userInput.js');

const fixData = data => sanitize(s(data).unescapeHTML().replaceAll('\\', ''));

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
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-sanitize-advices', configuration);
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

module.exports = { fixData };
