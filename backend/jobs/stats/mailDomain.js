#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const moment = require('moment');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');

/**
 *  Can be launched with the following command
 *  `node jobs/stats/mailDomain --since [date] --to [date]`
 *
 * You can manualy export stats to a CSV file : mongoexport --db anotea --collection domainMailStats --type csv --fields _id,count,mailOpen,linkClick  --out stats.csv
 **/
const main = async () => {

    const client = await getMongoClient(configuration.mongodb.uri);
    const db = client.db();
    const logger = getLogger('anotea-job-stats-mail-domain', configuration);

    let filter = { mailSent: true };

    cli.option('-s, --since [date]', 'The optional date limit since generate stats')
    .option('-s, --to [date]', 'The optional date limit to generate stats')
    .parse(process.argv);

    if (cli.since !== undefined) {
        filter.mailSentDate = { $gte: moment(cli.since, 'DD/MM/YYYY').toDate() };
    }

    if (cli.to !== undefined) {
        filter.mailSentDate = Object.assign(filter.mailSentDate, { $lte: moment(cli.to, 'DD/MM/YYYY').toDate() });
    }

    logger.info(`Generating stats for mail domain...`);

    await db.collection('mailStats').remove({});

    logger.info(`Step 1/4 : OK`);

    const trainees = db.collection('trainee').find(filter).stream();
    trainees.on('data', trainee => {
        db.collection('mailStats').insert({
            token: trainee.token,
            tracking: trainee.tracking,
            mailDomain: trainee.trainee.mailDomain,
            date: trainee.mailSentDate
        });
    });

    trainees.on('finish', () => {
        logger.info(`Step 2/4 : OK`);
        const comments = db.collection('comment').find().stream();

        comments.on('data', comment => {
            db.collection('mailStats').update({ token: comment.token }, { $set: { step: comment.step } });
        });

        comments.on('finish', () => {
            logger.info(`Step 3/4 : OK`);
            db.collection('mailStats').aggregate([
                {
                    $group: {
                        _id: '$mailDomain',
                        count: { $sum: 1 },
                        mailOpen: { $sum: { $cond: ['$tracking', 1, 0] } },
                        linkClick: { $sum: { $cond: { if: { $gte: ['$step', 1] }, then: 1, else: 0 } } }
                    }
                },
                {
                    $match: {
                        count: { $gt: 1 }
                    }
                },
                { $out: 'domainMailStats' }
            ]).toArray(err => {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info(`Step 4/4 : OK`);
                    logger.info('Generating stats finished');
                }
                client.close();
            });
        });
    });
};

main();
