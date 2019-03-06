#!/usr/bin/env node
'use strict';

const { execute } = require('../job-utils');

execute(async ({ logger, db, configuration }) => {
    await require('./export-stagiaires')(logger, db, configuration);
});
