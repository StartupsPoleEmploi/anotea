#!/usr/bin/env node
'use strict';

module.exports = db => {
    return Promise.all([
        db.collection('account').updateMany({}, {
            $rename: { password: 'passwordHash' },
        })
    ]);
};
