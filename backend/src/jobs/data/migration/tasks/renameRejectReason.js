const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let updated = 0;
    let cursor = db.collection('comment').find({ rejectReason: { $type: 'string' } });
    await batchCursor(cursor, async next => {
        let comment = await next();

        let results = await db.collection('comment').updateOne({ token: comment.token }, {
            $set: {
                'qualification': comment.rejectReason,
            },
            $unset: {
                rejectReason: 1
            }
        });

        if (results.result.nModified === 1) {
            updated++;
        }
    });

    await db.collection('comment').updateOne({ $or: [{ rejectReason: null }, { rejectReason: false }] }, {
        $unset: {
            rejectReason: 1
        }
    });

    return {
        updated,
    };
};
