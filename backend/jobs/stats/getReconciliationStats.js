#!/usr/bin/env node
'use strict';

const mongo = require('mongodb');
const configuration = require('config');

const getMongoClient = () => mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true });

process.on('unhandledRejection', r => console.error(r));
process.on('uncaughtException', r => console.error(r));

const main = async () => {

    let client = await getMongoClient();
    let sessionsReconciliees = client.db().collection('sessionsReconciliees');

    const computeStats = (name, inseeCode) => {
        return Promise.all([
            sessionsReconciliees.countDocuments({ region: inseeCode }),
            sessionsReconciliees.countDocuments({
                'region': inseeCode,
                'score.nb_avis': { $gte: 1 }
            }),
            sessionsReconciliees.countDocuments({
                'region': inseeCode,
                'score.nb_avis': { $gte: 3 }
            })
        ]).then(results => {
            let nbSessionsAvecAvis = results[1];
            let nombreDeSessionsActives = results[0];
            return {
                region: name,
                inseeCode,
                nbSessionsAvecAvis,
                nombreDeSessionsActives,
                pourcentageDeSessionsAvecAuMoinsUnAvis: Math.ceil((nbSessionsAvecAvis * 100) / nombreDeSessionsActives),
                pourcentageDeSessionsAvecAuMoinsTroisAvis: Math.ceil((results[2] * 100) / nombreDeSessionsActives)
            };
        });
    };

    Promise.all([
        computeStats('Pays de la Loire', '52'),
        computeStats('Île-de-France', '11'),
        computeStats('Auvergne-Rhône-Alpes', '84'),
    ]).then(res => {
        res.forEach(stats => console.log(JSON.stringify(stats, null, 2)));
        client.close();
    });
};

main();

