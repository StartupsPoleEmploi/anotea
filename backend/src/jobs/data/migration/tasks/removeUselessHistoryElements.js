const moment = require('moment');
const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let update = async collectionName => {
        let cursor = db.collection(collectionName).find({ 'meta.history.3': { $exists: true } });
        let updated = 0;

        await batchCursor(cursor, async next => {
            let doc = await next();

            let results = await db.collection(collectionName).updateOne({ token: doc.token }, {
                $set: {
                    'meta.history': doc.meta.history.filter(h => moment(h.date).isBefore(moment('2019-12-01 00Z'))),
                }
            });

            if (results.result.nModified === 1) {
                updated++;
            }
        });

        return updated;
    };

    let [trainee, comment] = await Promise.all([
        update('trainee'),
        update('comment'),
    ]);

    return { trainee, comment };
};
