#!/usr/bin/env node
'use strict';

const { program: cli } = require('commander');
const { execute } = require('../../job-utils');
const importCommunes = require('./tasks/importCommunes');

cli
.option('--communes [communes]', 'The postal codes CSV file to import')
.option('--cedex [cedex]', 'The cedex CSV file to import')
.parse(process.argv);

const { communes, cedex } = cli.opts();

execute(async ({ logger, db, exit }) => {

    if (!communes || !cedex) {
        return exit('Invalid arguments');
    }

    let stats = {};
    stats.importCommunes = await importCommunes(db, logger, communes, cedex);
    return stats;
});
