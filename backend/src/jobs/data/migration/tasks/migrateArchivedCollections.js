
module.exports = db => {
    return {
        migrateArchivedCollections: (sourceCollection, destinationCollection) => {
            return new Promise(async (resolve, reject) => {

                let migrated = 0;
                let promises = [];

                db.collection(`${sourceCollection}`).update({}, { $set: { archived: true } })
                .on('data', async doc => {
                    migrated++;
                    let p = Promise.all([
                        db.collection(`${destinationCollection}`).insertOne(doc),
                        db.collection(`${sourceCollection}`).deleteOne({ _id: doc._id }),
                    ]);
                    promises.push(p);
                })
                .on('error', () => reject())
                .on('end', async () => {
                    await Promise.all(promises);
                    resolve({ collection: sourceCollection, migrated });
                });
            });
        }
    };
};
