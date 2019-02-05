#!/usr/bin/env node
'use strict';

const cli = require('commander');
const path = require('path');
const { execute } = require('../../job-utils');
const createIndexes = require('../../data/indexes/createIndexes');
const createAccounts = require('./createAccounts');
const createRegionalData = require('./createRegionalData');
const importIntercarif = require('../intercarif/importIntercarif');
const generateSessions = require('../sessions/generateSessions');
const generateActions = require('../sessions/generateActions');
const generateOrganismesFromIntercarif = require('../organismes/generateOrganismesFromIntercarif');
const synchronizeOrganismesWithAccounts = require('../organismes/synchronizeOrganismesWithAccounts');
const computeOrganismesScore = require('../organismes/computeOrganismesScore');
const createAvis = require('./createAvis');

cli.description('Inject dataset')
.option('-a, --avis [avis]', 'Path to file with commentaires')
.option('-d, --drop', 'Drop database')
.option('-p, --password [password]', 'Password for injected accounts')
.parse(process.argv);

execute(async ({ db, logger, moderation, exit }) => {

    if (!cli.password) {
        exit('Invalid arguments');
    }

    if (cli.drop) {
        logger.info('Dropping database....');
        await db.dropDatabase();
    }

    await Promise.all([
        createIndexes(db),
        createRegionalData(db),
    ]);

    await importIntercarif(db, logger, path.join(__dirname, '../../../../test/helpers/data/intercarif-data-test.xml'));

    await generateSessions(db);
    await generateActions(db);

    await generateOrganismesFromIntercarif(db, logger);
    await synchronizeOrganismesWithAccounts(db, logger);
    await computeOrganismesScore(db, logger);

    await createAccounts(db, cli.password);

    await createAvis(db, moderation, cli.avis ? require(cli.avis) : {});

    return { dataset: 'ready' };
});
