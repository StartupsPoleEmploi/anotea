#!/usr/bin/env node
'use strict';

const mongo = require('mongodb');
const configuration = require('config');
const regions = require('../../components/regions');

const getMongoClient = () => mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true });

process.on('unhandledRejection', r => console.error(r));
process.on('uncaughtException', r => console.error(r));

const main = async () => {

    let client = await getMongoClient();
    let db = client.db();
    let { findRegionByCodeRegion } = regions(db);

    const computeSessionStats = async (name, codeINSEE) => {

        let sessionsReconciliees = db.collection('sessionsReconciliees');

        let [nbSessions, nbSessionsAvecAuMoinsUnAvis, nbSessionsAuMoinsTroisAvis] = await Promise.all([
            sessionsReconciliees.countDocuments({ region: codeINSEE }),
            sessionsReconciliees.countDocuments({ 'region': codeINSEE, 'score.nb_avis': { $gte: 1 } }),
            sessionsReconciliees.countDocuments({ 'region': codeINSEE, 'score.nb_avis': { $gte: 3 } })
        ]);

        return {
            region: name,
            nbSessions,
            nbSessionsAvecAuMoinsUnAvis,
            pourcentageDeSessionsAvecAuMoinsUnAvis: Math.ceil((nbSessionsAvecAuMoinsUnAvis * 100) / nbSessions),
            pourcentageDeSessionsAvecAuMoinsTroisAvis: Math.ceil((nbSessionsAuMoinsTroisAvis * 100) / nbSessions)
        };
    };

    const computeOrganismesStats = async (name, codeRegion) => {

        let organismes = db.collection('organismes');

        let [nbOrganimes, nbOrganismesAvecAvis] = await Promise.all([
            organismes.countDocuments({ 'codeRegion': codeRegion }),
            organismes.countDocuments({ 'meta.nbAvis': { $gte: 1 }, 'codeRegion': codeRegion }),
        ]);

        return {
            region: name,
            nbOrganimes,
            nbOrganismesAvecAvis,
            pourcentageOrganismesAvecAuMoinsUnAvis: Math.ceil((nbOrganismesAvecAvis * 100) / nbOrganimes),
        };
    };

    let activeRegions = configuration.app.active_regions;
    let sessions = await Promise.all(activeRegions.map(codeRegion => {
        let { name, codeINSEE } = findRegionByCodeRegion(codeRegion);
        return computeSessionStats(name, codeINSEE);
    }));

    let organismes = await Promise.all(activeRegions.map(codeRegion => {
        let { name } = findRegionByCodeRegion(codeRegion);
        return computeOrganismesStats(name, codeRegion);
    }));

    console.log(JSON.stringify({ sessions, organismes }, null, 2));

    await client.close();
};

main();

