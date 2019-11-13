const _ = require('lodash');
const { batchCursor, getNbModifiedDocuments } = require('../../../job-utils');

module.exports = db => {

    let update = async collectionName => {
        let cursor = db.collection(collectionName).find();
        let updated = 0;

        await batchCursor(cursor, async next => {
            let doc = await next();

            let code = doc.training.certifInfo.id;
            let results = await db.collection(collectionName).updateOne({ token: doc.token }, {
                $set: {
                    'training.certifInfos': _.isEmpty(code) ? [] : [code],
                },
                $unset: {
                    'training.certifInfo': 1,
                }
            });

            let nbModifiedDocuments = getNbModifiedDocuments(results);
            if (nbModifiedDocuments > 0) {
                updated += nbModifiedDocuments;
            }
        });

        return updated;
    };

    return Promise.all([
        update('trainee'),
        update('comment'),
    ])
    .then(results => {
        return { trainee: results[0], comment: results[1] };
    });
};
