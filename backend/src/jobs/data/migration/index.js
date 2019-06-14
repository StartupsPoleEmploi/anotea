#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');

execute(async ({ db }) => {
    await require('./tasks/cleanCertifInfos')(db);
    await require('./tasks/renamePatchProperty')(db);
    await require('./tasks/syncTrainingProperty')(db);
});
