const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let pushRefreshedIntoHistory = async collectionName => {
        let updated = 0;
        let cursor = db.collection(collectionName).find({ 'meta.refreshed': { $exists: true } });
        await batchCursor(cursor, async next => {
            let doc = await next();

            doc.meta = doc.meta || {};
            doc.meta.history = [...(doc.meta.history || []), ...doc.meta.refreshed.map(d => {
                return {
                    date: d.date,
                    ...d.diff,
                };
            })];

            delete doc.meta.refreshed;

            let results = await db.collection(collectionName).replaceOne({ token: doc.token }, doc);

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
