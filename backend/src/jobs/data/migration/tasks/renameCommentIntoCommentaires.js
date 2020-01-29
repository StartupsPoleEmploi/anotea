const { batchCursor } = require('../../../job-utils');
const { getNbModifiedDocuments } = require('../../../job-utils');

module.exports = async db => {

    let res = await db.collection('avis').updateMany({},
        {
            $rename: {
                'comment': 'commentaire',
            },
        }
    );

    let updated = 0;
    let cursor = db.collection('avis').find({
        'meta.history.comment': { $exists: true },
    });

    await batchCursor(cursor, async next => {
        let avis = await next();

        let results = await db.collection('avis').updateOne({ _id: avis._id }, {
            $set: {
                'meta.history': avis.meta.history.map(h => {
                    if (h.comment) {
                        h.commentaire = h.comment;
                        delete h.comment;
                    }
                    return h;
                }),
            }
        });

        if (results.result.nModified === 1) {
            updated++;
        }
    });


    return { renamed: getNbModifiedDocuments(res), history: updated };
};
