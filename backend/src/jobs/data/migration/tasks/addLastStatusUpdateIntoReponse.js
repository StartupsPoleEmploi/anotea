const { batchCursor } = require('../../../job-utils');

module.exports = async db => {
    let cursor = db.collection('comment').find({
        'reponse.date': { $exists: true },
        'reponse.lastStatusUpdate': { $exists: false }
    });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let comment = await next();

        let results = await db.collection('comment').updateOne({ token: comment.token }, {
            $set: {
                'reponse.lastStatusUpdate': comment.reponse.date,
            }
        });

        if (results.result.nModified === 1) {
            updated++;
        }
    });

    return {
        updated,
    };
};
