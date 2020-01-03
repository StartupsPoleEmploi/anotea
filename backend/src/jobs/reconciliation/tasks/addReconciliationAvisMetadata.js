const _ = require("lodash");
const { batchCursor } = require("../../job-utils");

module.exports = async db => {

    let updated = 0;

    let cursor = db.collection("comment").find();
    await batchCursor(cursor, async next => {
        let comment = await next();

        let count = await db.collection("actionsReconciliees").countDocuments({ "avis.id": comment._id });

        let reconciliations = _.get(comment, "meta.reconciliations");
        let isReconciliable = count > 0;

        if (!reconciliations || (reconciliations[0].reconciliable !== isReconciliable)) {
            await db.collection("comment").updateOne({ _id: comment._id }, {
                $push: {
                    "meta.reconciliations": {
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
