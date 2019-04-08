#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db, logger }) => {
    let [avis, stagiaires] = await Promise.all([
        require('./remove-duplicated-documents')(db, logger, 'comment'),
        require('./remove-duplicated-documents')(db, logger, 'trainee'),
    ]);

    return { avis, stagiaires };
});
