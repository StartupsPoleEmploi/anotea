const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let rollback = collectionName => {
        let cursor = db.collection(collectionName).find({ 'meta.patch.organisation': { $exists: true } });
        return batchCursor(cursor, async next => {
            let doc = await next();

            return db.collection(collectionName).updateOne({ _id: doc._id }, {
                $set: {
                    'training.organisation.siret': doc.meta.patch.organisation.siret,
                    'training.organisation.name': doc.meta.patch.organisation.name,
                },
                $unset: {
                    'meta.patch.organisation': 1,
                }

            });
        });
    };

    return Promise.all([
        rollback('comment'),
        rollback('trainee'),
    ]);

};
