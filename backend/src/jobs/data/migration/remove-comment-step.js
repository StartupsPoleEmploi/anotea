#!/usr/bin/env node
'use strict';

module.exports = async db => {
    let promises = [];
    let cursor = await db.collection('comment').find({ step: { $ne: null } });

    while (await cursor.hasNext()) {
        let comment = await cursor.next();

        let promise = comment.step === 1 ?
            db.collection('comment').removeOne({ token: comment.token }) :
            db.collection('comment').updateOne({ token: comment.token }, { $unset: { step: '' } });

        promises.push(Promise.all([
            promise,
            db.collection('trainee')
            .updateOne({ token: comment.token }, { $set: { 'tracking.click': comment.date } })
        ]));
    }

    return Promise.all(promises);

};
