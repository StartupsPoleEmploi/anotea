#!/usr/bin/env node
'use strict';

module.exports = db => {
    return Promise.all([
        db.collection('moderator').drop(),
        db.collection('financer').drop(),
    ]);
};
