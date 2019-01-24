#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {
    await require('./rename-password-to-passwordHash')(db);
    //await require('./merge-account')(db);
});
