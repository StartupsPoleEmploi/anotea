const moment = require('moment');
const getFormationsFromCSV = require('./utils/getFormationsFromCSV');

module.exports = async (db, logger, file) => {
    let start = moment();
    let total = 0;
    let collection = db.collection('intercarif');

    await collection.deleteMany({});

    return new Promise((resolve, reject) => {
        getFormationsFromCSV(file)
        .flatMap(async document => collection.insertOne(document))
        .subscribe(
            () => {
                let timeElapsed = moment().diff(start, 'seconds');
                logger.debug(`New formation inserted (${++total} documents / time elapsed: ${timeElapsed}s)`);
            },
            err => reject(err),
            () => resolve(),
        );
    });
};

