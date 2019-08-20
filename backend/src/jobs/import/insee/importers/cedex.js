module.exports = function(db, logger) {

    const fs = require('fs');
    const moment = require('moment');
    const parse = require('csv-parse');
    const transform = require('stream-transform');

    const doImport = file => {
        logger.info('Cedex <-> City Code INSEE mapping import - launch');

        let promises = [];
        return new Promise((resolve, reject) => {
            let launchTime = new Date().getTime();
            let parser = parse({ delimiter: ';'});
            let input = fs.createReadStream(file, { encoding: 'utf-8' });
            let count = 0;
            let transformer = transform(async (record, callback) => {
                let promise = new Promise(async (resolve, reject) => {
                    // skip CSV header
                    if (count > 0) {
                        await db.collection('inseeCode').updateOne({ insee: record[2] }, { $push: { cedex: record[0] } });
                    }
                    count++;
                    resolve();
                    callback();
                });
                promises.push(promise);
            }, { parallel: 10 }).on('finish', async () => {
                await Promise.all(promises);
                resolve();
                logger.info(`Cedex <-> City Code INSEE mapping import - completed (${count} mapping imported, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
            });
            input.pipe(parser).pipe(transformer);
        });
    };

    return {
        doImport: doImport
    };
};
