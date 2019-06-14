#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');

const syncStagiaireAndAvis = require('./syncStagiaireAndAvis');

execute(async ({ db }) => {
    return syncStagiaireAndAvis(db);
});

