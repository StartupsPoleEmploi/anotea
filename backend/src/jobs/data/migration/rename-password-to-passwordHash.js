#!/usr/bin/env node
'use strict';

module.exports = db => {
    return Promise.all([
        db.collection('accounts').updateMany({}, {
            $rename: { password: 'passwordHash' },
        })
    ]);
};
