const { batchCursor } = require('../../../job-utils');

module.exports = async db => {
    let cursor = db.collection('comment').find({ 'tracking.clickLink': { $exists: true } });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let avis = await next();

        let results = await db.collection('trainee').updateOne({ token: avis.token }, {
            $set: {
                'tracking.clickLinks': avis.tracking.clickLink,
            }
        });

        if (results.result.nModified === 1) {
            updated++;
        }
    });

    await db.collection('comment').updateMany({ 'tracking': { $exists: true } }, {
        $unset: {
            tracking: 1,
        }
    });

    return {
        updated,
    };
};
