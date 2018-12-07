#!/usr/bin/env node
'use strict';

const configuration = require('config');
const moment = require('moment');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');

const main = async () => {
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-avis-flag', configuration);
    let db = client.db();

    const abort = error => {
        logger.error(error, () => {
            client.close(() => process.exit(1));
        });
    };

    try {
        let launchTime = new Date().getTime();
        let promises = [];
        logger.info(`Launch...`);

        let cursor = db.collection('comment').find();
        while (await cursor.hasNext()) {
            let comment = await cursor.next();

            promises.push(db.collection('trainee').updateOne({ token: comment.token }, { $set: { avis: true } }));
        }

        await Promise.all(promises);
        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`);
    } catch (e) {
        abort(e);
    }
};

main();
