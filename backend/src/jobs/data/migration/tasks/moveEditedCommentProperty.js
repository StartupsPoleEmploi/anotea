const _ = require('lodash');
const { batchCursor } = require('../../../job-utils');

module.exports = async db => {
    let cursor = db.collection('comment').find({ 'editedComment': { $exists: true } });
    let updated = 0;

    await batchCursor(cursor, async next => {
        let avis = await next();
        let before = avis.comment.text;

        avis.comment.text = avis.editedComment.text;
        avis.meta = _.merge({}, avis.meta || {}, {
            history: [{
                date: avis.editedComment.date,
                comment: {
                    text: before,
                }
            }]
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
