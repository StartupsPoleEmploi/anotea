#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../job-utils');
const computeOrganismesStats = require('./tasks/computeOrganismesStats');
const computeAvisStats = require('./tasks/computeAvisStats');
const computeApiStats = require('./tasks/computeApiStats');
const computeCampaignStats = require('./tasks/computeCampaignStats');

cli.parse(process.argv);

execute(async ({ db, regions }) => {

    let stats = await Promise.all([
        computeOrganismesStats(db, regions),
        computeAvisStats(db, regions),
        computeApiStats(db, regions),
        computeCampaignStats(db, regions),
    ]);

    let doc = {
        date: new Date(),
        organismes: stats[0],
        avis: stats[1],
        api: stats[2],
        campaign: stats[3],
    };

    await db.collection('statistics').insertOne(doc);

    return doc;
});
