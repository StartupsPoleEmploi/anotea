const moment = require('moment');

module.exports = (db, logger) => {

    const SINCE = moment().subtract(24, 'months').format('YYYY-MM-DDTHH:mm:ss.SSSZ');

    let filter = { 'training.scheduledEndDate': { $lte: new Date(SINCE) } };
    let count = 0;

    const archive = (sourceCollection, destinationCollection) => {
        return new Promise(async (resolve, reject) => {
            let stream = db.collection(`${sourceCollection}`).find(filter).stream();

            let promises = [];

            stream.on('data', async doc => {
                count++;
                let p = new Promise(async (resolve, reject) => {
                    await db.collection(`${destinationCollection}`).insertOne(doc);
                    await db.collection(`${sourceCollection}`).deleteOne({ _id: doc._id });
                    resolve();
                });
                promises.push(p);
            });

            stream.on('error', () => {
                reject();
            });

            stream.on('end', async () => {
                await Promise.all(promises);
                resolve();
                logger.info(`Old ${sourceCollection}s archiving - completed (${count} ${sourceCollection}s)`);
            });
        });
    };

    return {
        archive: archive
    };

};
