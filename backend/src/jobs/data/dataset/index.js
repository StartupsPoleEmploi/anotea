#!/usr/bin/env node
'use strict';

const cli = require('commander');
const path = require('path');
const { execute } = require('../../job-utils');
const createIndexes = require('../indexes/tasks/createIndexes');
const createAccounts = require('./tasks/createAccounts');
const importIntercarif = require('../../import/intercarif/importIntercarif');
const reconcile = require('../../reconciliation/tasks/reconcile');
const generateOrganismesFromIntercarif = require('../../import/organismes/tasks/generateOrganismesFromIntercarif');
const synchronizeOrganismesWithAccounts = require('../../import/organismes/tasks/synchronizeOrganismesWithAccounts');
const computeOrganismesScore = require('../../import/organismes/tasks/computeScore');
const resetPasswords = require('../auth/reset-passwords/resetPasswords');
const createAvis = require('./tasks/createAvis');
const dumpAvis = require('./tasks/dumpAvis');

cli.description('Inject dataset')
.option('-d, --drop', 'Drop database')
.option('-p, --password [password]', 'Password for injected accounts')
.option('--dump [dump]', 'Absolute path to the dumped file')
.option('--generate', 'Generate a avis.json and exit')
.parse(process.argv);

execute(async ({ db, logger, moderation, exit, regions }) => {

    if (cli.generate) {
        if (!cli.dump) {
            exit('You must specified a dump file');
        }
        logger.info('Dumping avis from database....');
        return dumpAvis(db, cli.dump);
    }

    if (cli.drop) {
        logger.info('Dropping database....');
        await db.dropDatabase();
    }

    await Promise.all([
        createIndexes(db),
    ]);

    let file = path.join(__dirname, '../../../../test/helpers/data/intercarif-data-test.xml');
    logger.info(`Importing intercarif fomr file ${file}....`);
    await importIntercarif(db, logger, file, regions);

    logger.info(`Generating avis and reconcile them....`);
    await reconcile(db, logger);
    await createAvis(db, moderation, cli.dump ? require(cli.dump) : {});
    await reconcile(db, logger);

    logger.info(`Creating organismes....`);
    await generateOrganismesFromIntercarif(db, logger);
    await synchronizeOrganismesWithAccounts(db, logger, regions);
    await computeOrganismesScore(db, logger);

    logger.info(`Creating accounts....`);
    await createAccounts(db, logger);

    logger.info(`Resetting all passwords....`);
    await resetPasswords(db, cli.password || 'password', { force: true });


    return { dataset: 'ready' };
});
