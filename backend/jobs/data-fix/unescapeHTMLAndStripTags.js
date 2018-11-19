#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');
const s = require('string');

const doUnescapeHTMLAndStripTags = (db, logger, abort) => {

    let stream = db.collection('comment').find({ comment: { $ne: null } });
    stream.on('data', advice => {
        advice.comment.pseudo = s(advice.comment.pseudo).stripTags();
        advice.comment.pseudo = s(advice.comment.title).unescapeHTML().stripTags();
        advice.comment.pseudo = s(advice.comment.text).unescapeHTML().stripTags();
        db.collection('comment').save(advice);
    });
};

cli.description('Remove escaped HTML content and strip tags from comment (user input)');

const main = async () => {
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-unescapeHTML-and-StripTags', configuration);
    let db = client.db();

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    doUnescapeHTMLAndStripTags(db, logger, abort);
};

main();
