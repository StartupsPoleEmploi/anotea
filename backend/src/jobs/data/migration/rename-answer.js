#!/usr/bin/env node
'use strict';

module.exports = db => {
    return db.collection('comment').updateMany({ answer: { $exists: true } }, { $rename: { 'answer': 'reponse' } });
};
