#!/usr/bin/env node
'use strict';

module.exports = async db => {

    await db.collection('forgottenPasswordTokens').removeMany({});
    await db.collection('invalidAuthTokens').removeMany({});

    await db.collection('organismes').rename('accounts');
    await db.collection('accounts').updateMany({}, {
        $set: { profile: 'organisme' },
    });

    let cursor = db.collection('financer').find();
    while (await cursor.hasNext()) {
        const financer = await cursor.next();
        delete financer._id;
        financer.profile = 'financeur';
        await db.collection('accounts').insertOne(financer);
    }

    cursor = db.collection('moderator').find();
    while (await cursor.hasNext()) {
        const moderator = await cursor.next();
        delete moderator._id;
        moderator.profile = 'moderateur';
        await db.collection('accounts').insertOne(moderator);
    }
};
