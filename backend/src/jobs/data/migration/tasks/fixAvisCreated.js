const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let stats = { updated: 0 };

    let cursor = db.collection('trainee').find();
    await batchCursor(cursor, async next => {
        const { token } = await next();
        let count = await db.collection('comment').countDocuments({ token });

        let res = await db.collection('trainee').updateOne({ token }, { $set: { avisCreated: count > 0 } });
        if (res.result.nModified > 0) {
            stats.updated++;
        }
    });

    return stats;
};

