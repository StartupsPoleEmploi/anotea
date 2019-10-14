const { batchCursor } = require('../../../job-utils');

module.exports = async db => {
    let cursor = db.collection('comment').find({ 'meta.reconciliations': { $exists: true } });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let comment = await next();

        let reconciliations = comment.meta.reconciliations;
        let newReconciliations = reconciliations.reverse().reduce((acc, r) => {
            let length = acc.length;
            if (length === 0 || acc[length - 1].reconciliable !== r.reconciliable) {
                acc.push(r);
            }
            return acc;
        }, []).reverse();
        let results = await db.collection('comment').updateOne({ token: comment.token }, {
            $set: {
                'meta.reconciliations': newReconciliations
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
