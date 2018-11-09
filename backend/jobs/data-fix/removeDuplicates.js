#!/usr/bin/env node
'use strict';

const cli = require('commander');
const configuration = require('config');
const getMongoClient = require('../../components/mongodb');
const getLogger = require('../../components/logger');

const doRemoveDulicates = (db, logger, configuration, abort) => {

    let stream = db.collection('trainee').aggregate([
        { $match: { 'training.infoCarif.numeroSession': { $ne: 'NULL' } } },
        { $group: { _id: { email: '$trainee.email', formation: '$training.infoCarif.numeroSession' }, count: { $sum: 1 }, token: { $first: '$token' } } },
        { $match: { count: { $gte: 2 } } }
    ]);
    stream.on('data', trainee => {

        db.collection('comment').find({ 'trainee.email': trainee._id.email, 'training.infoCarif.numeroSession': trainee._id.formation }).toArray((err, comments) => {
            if (err) {
                abort(err);
            }

            if (comments.length) {
                let goodTrainee = comments.find(comment => comment.comment !== null);

                if (goodTrainee === undefined) {
                    goodTrainee = comments.find(comment => comment.rates !== null);

                }
                if (goodTrainee !== undefined) {
                    db.collection('trainee').deleteMany({
                        token: { $ne: goodTrainee.token },
                        'trainee.email': trainee._id.email,
                        'training.infoCarif.numeroSession': trainee._id.formation
                    });

                    db.collection('comment').deleteMany({
                        token: { $ne: goodTrainee.token },
                        'trainee.email': trainee._id.email,
                        'training.infoCarif.numeroSession': trainee._id.formation
                    });
                } else {
                    db.collection('trainee').deleteMany({
                        token: { $eq: trainee.token },
                        'trainee.email': trainee._id.email,
                        'training.infoCarif.numeroSession': trainee._id.formation
                    });
                    db.collection('comment').deleteMany({
                        token: { $eq: trainee.token },
                        'trainee.email': trainee._id.email,
                        'training.infoCarif.numeroSession': trainee._id.formation
                    });
                }
            } else {
                db.collection('trainee').deleteMany({
                    token: { $ne: trainee.token },
                    'trainee.email': trainee._id.email,
                    'training.infoCarif.numeroSession': trainee._id.formation
                });
            }
        });
    });
};

cli.description('Remove duplicates trainee and comments');


const main = async () => {
    let client = await getMongoClient(configuration.mongodb.uri);
    let logger = getLogger('anotea-job-remove-duplicates', configuration);
    let db = client.db();

    const abort = message => {
        logger.error(message, () => {
            client.close(() => process.exit(1));
        });
    };

    doRemoveDulicates(db, logger, configuration, abort);
};

main();
