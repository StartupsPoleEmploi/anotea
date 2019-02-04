#!/usr/bin/env node
'use strict';

const cli = require('commander');
const path = require('path');
const { execute } = require('../../job-utils');
const createIndexes = require('../indexes/createIndexes');
const createAccounts = require('./createAccounts');
const createAvis = require('./createAvis');
const createRegionalData = require('./createRegionalData');
const importIntercarif = require('../../import/intercarif/importIntercarif');
const generateSessions = require('../../import/sessions/generateSessions');
const generateActions = require('../../import/sessions/generateActions');
const generateOrganismesFromIntercarif = require('../../import/organismes/generateOrganismesFromIntercarif');
const synchronizeOrganismesWithAccounts = require('../../import/organismes/synchronizeOrganismesWithAccounts');
const computeOrganismesScore = require('../../import/organismes/computeOrganismesScore');

cli.description('Inject dataset')
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

    await createAvis(db, moderation);

    return { dataset: 'ready' };
});
