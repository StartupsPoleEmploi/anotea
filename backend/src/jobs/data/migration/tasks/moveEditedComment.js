const { batchCursor } = require('../../../job-utils');

module.exports = async db => {
    let updated = 0;
    let cursor = db.collection('comment').find({ 'editedComment': { $exists: true } });
    await batchCursor(cursor, async next => {
        let avis = await next();
        let before = avis.comment.text;

        avis.comment.text = avis.editedComment.text;
        avis.meta = avis.meta || {};
        avis.meta.history = avis.meta.history || [];
        avis.meta.history.unshift({
            date: avis.editedComment.date,
            comment: {
                text: before,
            }
        });
        delete avis.editedComment;

        let results = await db.collection('comment').replaceOne({ token: avis.token }, avis);

        if (results.result.nModified === 1) {
            updated++;
        }
    });

    return {
        updated,
    };
};
