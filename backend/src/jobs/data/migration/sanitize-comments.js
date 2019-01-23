#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {

    //Remove deprecated trainee field
    await db.collection('comment').updateMany({ 'trainee': { $exists: true } }, {
        $unset: { 'trainee': 1 },
    });

    //Remove null comment
    await db.collection('comment').updateMany({ 'comment': null }, {
        $unset: { 'comment': 1 },
    });
});
