#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {
    await require('./remove-comment-step')(db);
    await require('./remove-old-accounts')(db);
    await require('./rename-answer')(db);
});
