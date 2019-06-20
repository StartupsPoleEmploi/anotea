#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const computeStats = require('./tasks/computeStats');

cli.parse(process.argv);

execute(async ({ db, regions }) => {

    let { computeOrganismesStats, computeAvisStats } = computeStats(db, regions);

    let [organismes, avis] = await Promise.all([computeOrganismesStats(), computeAvisStats()]);

    await db.collection('statistics').insertOne({
        date: new Date(),
        organismes,
        avis,
    });

    return { organismes, avis };
});
