#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../job-utils');
const dropIndexes = require('./dropIndexes');
const createIndexes = require('./createIndexes');
const findUnusedIndexes = require('./findUnusedIndexes');

cli.description('Manage indexes')
.option('-f, --find', 'Find unused indexex')
.option('-d, --drop', 'Drop all indexesx')
.parse(process.argv);

execute(async ({ db, logger }) => {

    if (cli.find) {
        return await findUnusedIndexes(db);
    }

    if (cli.drop) {
        logger.info('Dropping indexes....');
        await dropIndexes(db);
    }

    logger.info('Creating indexes....');
    return createIndexes(db);
});
