#!/usr/bin/env node
'use strict';

const { program: cli } = require('commander');
const { execute } = require('../job-utils');
const computeStats = require('./tasks/computeStats');

cli.parse(process.argv);

execute(({ db, regions }) => {
    return computeStats(db, regions);
});
