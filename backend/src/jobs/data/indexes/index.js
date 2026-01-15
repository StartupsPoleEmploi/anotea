#!/usr/bin/env node
'use strict';

const { program: cli } = require('commander');
const { execute } = require('../../job-utils');
const dropIndexes = require('./tasks/dropIndexes');
const createIndexes = require('./tasks/createIndexes');
const findUnusedIndexes = require('./tasks/findUnusedIndexes');

cli.description('Manage indexes')
.option('-f, --find', 'Find unused indexex')
.option('-d, --drop', 'Drop all indexesx')
.parse(process.argv);

const { find, drop } = cli.opts();

execute(async ({ db, logger }) => {

    if (find) {
        return await findUnusedIndexes(db);
    }

    if (drop) {
        logger.info('Dropping indexes....');
        await dropIndexes(db);
    }

    logger.info('Creating indexes....');
    return createIndexes(db);
});
