const _ = require('lodash');
const { batchCursor, getNbModifiedDocuments } = require('../../../job-utils');

module.exports = db => {

    let update = async collectionName => {
        let cursor = db.collection(collectionName).find();
        let updated = 0;

        await batchCursor(cursor, async next => {
            let doc = await next();

            let certifInfo = doc.training.certifInfo.id;
            let formacode = doc.training.formacode;

            let results = await db.collection(collectionName).updateOne({ token: doc.token }, {
                $set: {
                    'training.certifInfos': _.isEmpty(certifInfo) ? [] : [certifInfo],
                    'training.formacodes': _.isEmpty(formacode) ? [] : [formacode],
                },
                $unset: {
                    'training.certifInfo': 1,
                    'training.formacode': 1,
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
