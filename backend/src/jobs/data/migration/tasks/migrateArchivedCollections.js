const { batchCursor } = require('../../../job-utils');

module.exports = db => {
            
    return {
        migrateArchivedCollections: () => {

            let rollback = (sourceCollection, destinationSource, filter) => {

                let cursor = db.collection(sourceCollection).find();
                
                return batchCursor(cursor, async next => {
                    let doc = await next();
        
                    return db.collection(destinationSource).insertOne({ ...doc, ...filter });
                });
            };


            return Promise.all([
                rollback('archivedComment', 'comment', { archived: true }),
                rollback('archivedTrainee', 'trainee'),
            ]);
        }
    };
};
