#!/usr/bin/env node
'use strict';

const { execute } = require('../../job-utils');

execute(async ({ db }) => {

    await db.collection('comment').updateMany({ answer: { $exists: true } }, {
        $rename: { answer: 'answer_renamed_temp' },
    });

    await db.collection('comment').updateMany({ answer_renamed_temp: { $exists: true } }, {
        $unset: { answered: '' },
        $rename: { answer_renamed_temp: 'answer.text' },
        $set: {
            'answer.status': 'published',
        },
    });
});
