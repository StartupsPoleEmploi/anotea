const _ = require('lodash');
const { batchCursor } = require('../../job-utils');

module.exports = async db => {

    let updated = 0;

    let cursor = db.collection('avis').find();
    await batchCursor(cursor, async next => {
        let avis = await next();

        let count = await db.collection('actionsReconciliees').countDocuments({ 'avis._id': avis._id });

        let reconciliations = _.get(avis, 'meta.reconciliations');
        let isReconciliable = count > 0;

        if (!reconciliations || (reconciliations[0].reconciliable !== isReconciliable)) {
            await db.collection('avis').updateOne({ _id: avis._id }, {
                $push: {
                    'meta.reconciliations': {
                        $each: [{
                            date: new Date(),
                            reconciliable: isReconciliable,
                        }],
                        $position: 0,
                    },
                }
            });
            updated++;
        }
    });

    return updated;
};
