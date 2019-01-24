#!/usr/bin/env node
'use strict';

module.exports = async db => {

    await db.collection('forgottenPasswordTokens').removeMany({});
    await db.collection('invalidAuthTokens').removeMany({});

    await db.collection('organismes').rename('account');
    await db.collection('account').updateMany({}, {
        $set: { profile: 'organisme' },
    });

    let financers = await db.collection('financer').find().toArray();

    financers.forEach(financer => {
        delete financer._id;
        financer.profile = 'financeur';
        db.collection('account').insertOne(financer);
    });

    let moderators = await db.collection('moderator').find().toArray();

    moderators.forEach(moderator => {
        delete moderator._id;
        moderator.profile = 'moderateur';
        db.collection('account').insertOne(moderator);
    });
};
