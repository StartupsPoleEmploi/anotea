#!/usr/bin/env node
'use strict';

module.exports = db => {
    return Promise.all([
        db.collection('financer').updateMany({}, {
            $rename: { password: 'passwordHash' },
        }),
        db.collection('moderator').updateMany({}, {
            $rename: { password: 'passwordHash' },
        }),
    ]);
};
