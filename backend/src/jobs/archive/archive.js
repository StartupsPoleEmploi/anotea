const moment = require('moment');

module.exports = db => {
    return {
        archive: sourceCollection => {
            return new Promise(async (resolve, reject) => {

                let archived = 0;
                let promises = [];

                db.collection(`${sourceCollection}`)
                .find({
                    'training.scheduledEndDate': {
                        $lte: new Date(moment().subtract(24, 'months').format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
                    }
                })
                .on('data', async doc => {
                    archived++;
                    let p = db.collection(`${sourceCollection}`).updateOne({ _id: doc._id }, { $set: { 'archived': true } });
                    promises.push(p);
                })
                .on('error', () => reject())
                .on('end', async () => {
                    await Promise.all(promises);
                    resolve({ collection: sourceCollection, archived });
                });
            });
        },

        initArchivedField: sourceCollection => {
            return db.collection(`${sourceCollection}`).updateMany({ }, { $set: { 'archived': false } });
        }
    };

};
