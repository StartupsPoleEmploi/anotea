#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {
    await db.collection('financeur').updateMany({}, {
        $rename: { passwordprofile: 'passwordHash' },
    });

    await db.collection('moderator').updateMany({}, {
        $rename: { password: 'passwordHash' },
    });
});
