#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');

const cleanCertifInfos = require('./cleanCertifInfos');
const syncStagiaireAndAvis = require('./syncStagiaireAndAvis');

execute(async ({ db }) => {
    return Promise.all([
        cleanCertifInfos(db),
        syncStagiaireAndAvis(db),
    ]);
});
