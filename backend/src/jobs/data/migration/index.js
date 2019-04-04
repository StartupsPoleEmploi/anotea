#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {
    await require('./remove-departements')(db);
    await require('./remove-regions')(db);
});
