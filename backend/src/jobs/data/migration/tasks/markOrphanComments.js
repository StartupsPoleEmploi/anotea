const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let stats = { updated: 0 };

    let cursor = db.collection('comment').find();
    await batchCursor(cursor, async next => {
        const { token } = await next();
        let count = await db.collection('trainee').countDocuments({ token });

        if (count === 0) {
            await db.collection('comment').updateOne({ token }, { $set: { 'meta.orphan': true } });
            stats.updated++;
        }
    });

    return stats;
};

