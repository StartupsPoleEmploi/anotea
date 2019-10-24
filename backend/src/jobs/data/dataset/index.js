#!/usr/bin/env node
'use strict';

const cli = require('commander');
const path = require('path');
const { execute } = require('../../job-utils');
const createIndexes = require('../indexes/tasks/createIndexes');
const createAccounts = require('./tasks/createAccounts');
const importIntercarif = require('../../import/intercarif/importIntercarif');
const reconcile = require('../../reconciliation/tasks/reconcile');
const synchronizeOrganismesWithAccounts = require('../../organismes/tasks/synchronizeAccountsWithIntercarif');
const computeOrganismesScore = require('../../organismes/tasks/computeScore');
const resetPasswords = require('../reset/tasks/resetPasswords');
const createStagiaires = require('./tasks/createStagiaires');
const createAvis = require('./tasks/createAvis');
const emulateBackofficeActions = require('./tasks/emulateBackofficeActions');
const importCommunes = require('../../import/communes/tasks/importCommunes');

cli.description('Inject dataset')
.option('-d, --drop', 'Drop database')
.option('-p, --password [password]', 'Password for accounts')
.parse(process.argv);

execute(async ({ db, logger, moderation, consultation, regions, passwords }) => {

    if (cli.drop) {
        logger.info('Dropping database....');
        await db.dropDatabase();
    }

    let options = { nbStagiaires: 1000, notes: 10, commentaires: 500 };

    await createIndexes(db);

    let file = path.join(__dirname, '../../../../test/helpers/data/intercarif-data-test.xml');
    logger.info(`Importing intercarif fomr file ${file}....`);
    await importIntercarif(db, logger, file, regions);

    logger.info(`Generating stagiaires and avis....`);
    await reconcile(db, logger);//Just to get a valid session
    await createStagiaires(db, options);
    await createAvis(db, options);

    logger.info(`Creating organismes....`);
    await synchronizeOrganismesWithAccounts(db, logger, regions);
    await computeOrganismesScore(db, logger);

    logger.info(`Creating accounts....`);
    await createAccounts(db, logger);
    await resetPasswords(db, passwords, cli.password || 'password', { force: true });
    await emulateBackofficeActions(db, moderation, consultation, options);
    logger.info(`Reconcile avis and sessions....`);


    let communes = path.join(__dirname, '../../../../test/helpers/data/communes.csv');
    let cedex = path.join(__dirname, '../../../../test/helpers/data/cedex.csv');
    await importCommunes(db, logger, communes, cedex);

    await reconcile(db, logger);

    return { dataset: 'ready' };
});
