#!/usr/bin/env node
'use strict';

module.exports = async db => {
    let comments = await db.collection('comment').find({ step: { $ne: null } }).toArray();

    return Promise.all(comments.map(async comment => {
        db.collection('trainee').updateOne({ token: comment.token }, { $set: { 'tracking.click': comment.date } });
        if (comment.step === 1) {
            return db.collection('comment').removeOne({ token: comment.token });
        } else {
            return db.collection('comment').updateOne({ token: comment.token }, { $unset: { step: '' } });
        }
    }));
};
