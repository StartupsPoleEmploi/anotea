#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.renamePublishedStatuses = await require('./tasks/renamePublishedStatuses')(db);
    stats.unsetReportedQualification = await require('./tasks/unsetReportedQualification')(db);
    return stats;
});
