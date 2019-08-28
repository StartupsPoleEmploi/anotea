module.exports = function(db, logger) {

    const fs = require('fs');
    const moment = require('moment');
    const parse = require('csv-parse');
    const transform = require('stream-transform');

    const doImport = file => {
        logger.info('Postal Code <-> City Code INSEE mapping import - launch');

        let promises = [];
        return new Promise((resolve, reject) => {
            let launchTime = new Date().getTime();
            let parser = parse({ delimiter: ';', quote: '"' });
            let input = fs.createReadStream(file, { encoding: 'utf-8' });
            let count = 0;
            let transformer = transform(async (record, callback) => {
                let promise = new Promise(async (resolve, reject) => {
                    // skip CSV header
                    if (count > 0) {
                        let inseeCode = { insee: record[0], postalCode: record[2].split('/'), commune: record[1], cedex: [] };
                        await db.collection('inseeCode').insertOne(inseeCode);
                    }
                    callback();
                    count++;
                    resolve();
                });
                promises.push(promise);
            }, { parallel: 10 }).on('finish', async () => {
                await Promise.all(promises);
                resolve();
                logger.info(`Postal Code <-> City Code INSEE mapping import - completed (${count} mapping imported, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')})`);
            });
            input.pipe(parser).pipe(transformer);
        });
    };

    return {
        doImport: doImport
    };
};
