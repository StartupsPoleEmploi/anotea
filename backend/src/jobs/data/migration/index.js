#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.unsetPatchCertifInfos = await require('./tasks/unsetPatchCertifInfos')(db);
    stats.renameCertifInfos = await require('./tasks/renameCertifInfos')(db);
    return stats;
});
