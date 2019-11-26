const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let invalid = 0;

    let cursor = db.collection('trainee').find({ avisCreated: true });
    await batchCursor(cursor, async next => {
        let doc = await next();

        let count = await db.collection('comment').countDocuments({ token: doc.token });
        if (count === 0) {
            invalid++;
            await db.collection('trainee').updateOne({ token: doc.token }, {
                $set: {
                    'avisCreated': false,
                }
            });
        }
    });

    return { invalid };
};
