#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');

const cleanCertifInfos = require('./cleanCertifInfos');

execute(async ({ db }) => {
    await cleanCertifInfos(db);
});

