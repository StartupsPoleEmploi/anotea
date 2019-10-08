const _ = require('lodash');
const { batchCursor } = require('../../../job-utils');

module.exports = async db => {
    let cursor = db.collection('comment').find({ 'tracking.clickLink': { $exists: true } });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let avis = await next();

        let [results] = await Promise.all([
            db.collection('trainee').updateOne({ token: avis.token }, {
                $set: {
                    'tracking.clickLinks': avis.tracking.clickLink,
                }
            }),
            db.collection('comment').updateOne({ token: avis.token }, {
                $unset: {
                    tracking: 1,
                }
            })
        ]);

        if (results.result.nModified === 1) {
            updated++;
        }
    });

    return {
        updated,
    };
};
