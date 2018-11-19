#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const s = require('string');
const { sanitize } = require('../../components/userInput.js');

const fixData = data => sanitize(s(data).unescapeHTML().replaceAll('\\', ''));

const doUnescapeHTMLAndStripTags = (db, callback) => {

    const comment = db.collection('comment');

    let stream = comment.find({ comment: { $ne: null } });
    stream.on('data', advice => {
        if (advice.comment.pseudo) {
            advice.comment.pseudo = fixData(advice.comment.pseudo);
        }
        advice.comment.title = fixData(advice.comment.title);
        advice.comment.text = fixData(advice.comment.text);

        comment.save(advice);
    });

    stream.on('end', () => {
        callback();
    });
};

cli.description('Remove escaped HTML content and strip tags from advice comment (user input)');

const main = async () => {
    let client = await getMongoClient(configuration.mongodb.uri);
    let db = client.db();

    doUnescapeHTMLAndStripTags(db, () => {
        client.close();
    });
};

main();

module.exports = { fixData };
