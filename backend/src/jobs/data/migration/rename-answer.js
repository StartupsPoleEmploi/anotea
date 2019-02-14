#!/usr/bin/env node
'use strict';

module.exports = db => {
    return Promise.all([
        db.collection('comment').updateMany({ answer: { $exists: true } }, {
            $rename: { 'answer': 'reponse' }
        }),
        db.collection('comment').updateMany({ lastModerationAction: { $exists: true } }, {
            $rename: { 'lastModerationAction': 'lastStatusUpdate' }
        }),
    ]);
};
