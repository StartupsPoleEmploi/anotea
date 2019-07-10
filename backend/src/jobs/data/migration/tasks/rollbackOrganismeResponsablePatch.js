const { batchCursor } = require('../../../job-utils');

module.exports = async db => {

    let rollback = collectionName => {
        let cursor = db.collection(collectionName).find({ 'meta.patch.organisation': { $exists: true } });
        return batchCursor(cursor, async next => {
            let comment = await next();

            return db.collection('trainee').updateOne({ _id: comment._id }, {
                $set: {
                    'training.organisation.siret': comment.meta.patch.organisation.siret,
                    'training.organisation.name': comment.meta.patch.organisation.name,
                },
                $unset: {
                    'meta.patch.organisation': 0,
                }

            });
        });
    };

    return Promise.all([
        rollback('comment'),
        rollback('trainee'),
    ]);

};
