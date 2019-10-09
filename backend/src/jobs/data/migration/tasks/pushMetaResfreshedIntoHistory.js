const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let pushRefreshedIntoHistory = async collectionName => {
        let updated = 0;
        let cursor = db.collection(collectionName).find({ 'meta.refreshed': { $exists: true } });
        await batchCursor(cursor, async next => {
            let doc = await next();

            let history = [...(doc.meta.history || []), ...doc.meta.refreshed.map(d => {
                return {
                    date: d.date,
                    ...d.diff,
                };
            })].sort((v1, v2) => new Date(v2.date) - new Date(v1.date));

            let results = await db.collection(collectionName).updateOne({ token: doc.token }, {
                $set: {
                    'meta.history': history,
                },
                $unset: {
                    'meta.refreshed': 1,
                }
            });

            if (results.result.nModified === 1) {
                updated++;
            }
        });
        return updated;
    };


    return {
        trainee: await pushRefreshedIntoHistory('trainee'),
        comment: await pushRefreshedIntoHistory('comment'),
    };
};
