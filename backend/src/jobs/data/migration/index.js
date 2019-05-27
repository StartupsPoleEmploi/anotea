#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');

const activateEligibility = require('./activateEligibility');

execute(async ({ db }) => {
    await activateEligibility(db, '17');
});

