#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {
    let [fixInvalidReported] = await Promise.all([
        require('./fix-invalid-reported')(db),
    ]);

    return { fixInvalidReported };
});
