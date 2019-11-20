#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');
const cli = require('commander');

cli.parse(process.argv);

execute(async ({ db }) => {
    let stats = {};
    stats.unsetPatchCertifInfos = await require('./tasks/unsetPatchCertifInfos')(db);
    stats.renameCertifInfosAndFormacodes = await require('./tasks/renameCertifInfosAndFormacodes')(db);
    stats.sanitizePhoneNumbers = await require('./tasks/sanitizePhoneNumbers')(db);
    stats.sanitizeAvisCreated = await require('./tasks/sanitizeAvisCreated')(db);
    return stats;
});
