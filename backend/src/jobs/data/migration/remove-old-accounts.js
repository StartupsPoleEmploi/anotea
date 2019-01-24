#!/usr/bin/env node
'use strict';

module.exports = async db => {
    await db.collection('moderator').drop();
    await db.collection('financer').drop();
};
