const { batchCursor } = require('../../../job-utils');

module.exports = (db, logger) => {

    let stats = {
        trainee: {
            inserted: 0,
            invalid: 0,
        },
        comment: {
            inserted: 0,
            invalid: 0,
        },
    };

    return {
        migrateArchivedCollections: async () => {

            let rollback = (sourceCollection, destinationSource, filter = {}) => {

                let cursor = db.collection(sourceCollection).find();

                return batchCursor(cursor, async next => {
                    let doc = await next();

                    return db.collection(destinationSource)
                    .insertOne({ ...doc, ...filter })
                    .then(() => stats[destinationSource].inserted++)
                    .catch(e => {
                        stats[destinationSource].invalid++;
                        logger.error(e);
                    });
                });
            };

            await Promise.all([
                rollback('archivedAdvices', 'comment', { archived: true }),
                rollback('archivedTrainee', 'trainee'),
            ]);

            return stats;
        }
    };
};
