#!/usr/bin/env node
'use strict';
const { execute } = require('../../job-utils');

const removeCarifCollection = require('./removeCarifCollection');

execute(async ({ db }) => {
    await removeCarifCollection(db);
});

