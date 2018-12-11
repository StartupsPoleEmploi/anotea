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
        logger.info(`Launch...`);

        let cursor = db.collection('trainee').find();
        while (await cursor.hasNext()) {
            let trainee = await cursor.next();
            let nbAvis = await db.collection('comment').countDocuments({ token: trainee.token });
            await db.collection('trainee').updateOne({ token: trainee.token }, {
                $set: {
                    avisCreated: nbAvis > 0
                }
            });
        }

        await client.close();

        let duration = moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
        logger.info(`Completed in ${duration})`);
    } catch (e) {
        abort(e);
    }
};

main();
