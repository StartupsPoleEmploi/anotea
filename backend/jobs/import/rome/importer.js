module.exports = function(db, logger, configuration) {

    const fs = require('fs');
    const moment = require('moment');
    const parse = require('csv-parse');
    const transform = require('stream-transform');

    const doImport = file => {
        logger.info('ROME <-> FORMACODE mapping import - launch');

        let promises =[];
        return new Promise((resolve, reject) => {
            let launchTime = new Date().getTime();
            let parser = parse({ delimiter: ',', quote: '"' });
            let input = fs.createReadStream(file, { encoding: 'utf-8' });
            let count = 0;
            let transformer = transform(async (record, callback) => {
                let promise = new Promise(async (resolve, reject) => {
                    let formacodes = record[2].split('$').map(item => {
                        let formacodeArr = item.split(' ');
                        let formacode = formacodeArr.pop();
                        return { formacode: formacode, label: formacodeArr.join(' ') };
                    });
                    let romeFormacode = { codeROME: record[0], label: record[1], formacodes: formacodes };
                    await db.collection('formacodeRomeMapping').insertOne(romeFormacode);
                    callback();
                    count++;
                    resolve();
                });
                promises.push(promise);
            }, { parallel: 10 }).on('finish', async () => {
                await Promise.all(promises);
                resolve();
                logger.info(`ROME <-> FORMACODE mapping import - completed (${count} mapping imported, ${moment.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS')}`);
            });
            input.pipe(parser).pipe(transformer);
        });
    };

    return {
        doImport: doImport
    };
};
