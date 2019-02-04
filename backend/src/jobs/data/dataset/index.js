#!/usr/bin/env node
'use strict';

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

execute(async ({ db, logger, moderation }) => {

    let password = process.argv[2];

    await db.dropDatabase();

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

    await createAccounts(db, password);

    await createAvis(db, moderation);

    return { dataset: 'ready' };
});
