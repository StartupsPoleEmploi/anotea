#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');

execute(async ({ db }) => {
    await require('./tasks/dropCollections')(db);
    await require('./tasks/unsetReconciliations')(db);
});
