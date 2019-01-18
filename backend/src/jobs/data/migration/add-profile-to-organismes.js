#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {

    return db.collection('organismes').updateMany({}, {
        $set: { profile: 'organisme' },
    });
});
