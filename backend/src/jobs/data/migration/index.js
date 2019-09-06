#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.unsetRefreshedStatus = await require('./tasks/unsetDeprecatedMeta')(db);
    stats.dropDeprecatedCollections = await require('./tasks/dropDeprecatedCollections')(db);
    return stats;
});
