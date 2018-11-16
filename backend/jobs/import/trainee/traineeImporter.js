const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');
const md5File = require('md5-file/promise');
const validateTrainee = require('./validateTrainee');
const { handleBackPressure } = require('../../utils');

const getCampaignName = file => {
    const filename = path.basename(file);
    return filename.substring(0, filename.length - 4);
};

module.exports = (db, logger) => {

    return {
        importTrainee: async (file, handler, filters = {}) => {

            let campaign = getCampaignName(file);
            let hash = await md5File(file);

            const shouldBeImported = async (trainee) => {
                let sameRegion = !filters.codeRegion || filters.codeRegion === trainee.codeRegion;
                let isAfter = !filters.startDate || trainee.training.scheduledEndDate > filters.startDate;

                return sameRegion && isAfter && await handler.shouldBeImported(trainee);
            };

            return new Promise(async (resolve, reject) => {

                if (await db.collection('importTrainee').findOne({ hash })) {
                    reject(new Error(`CSV file ${file} already imported`));
                } else {

                    logger.info(`Trainee import ${handler.name}/${campaign}...`);

                    let results = {
                        total: 0,
                        imported: 0,
                        ignored: 0,
                        invalid: 0,
                    };

                    fs.createReadStream(file)
                    .pipe(parse(handler.csvOptions))
                    .pipe(handleBackPressure(async data => {
                        try {
                            let trainee = await handler.buildTrainee(data, campaign);

                            if (await shouldBeImported(trainee)) {
                                await validateTrainee(trainee);
                                await db.collection('trainee').insertOne(trainee);
                                return { status: 'imported', trainee };
                            } else {
                                return { status: 'ignored', trainee };
                            }
                        } catch (e) {
                            return { status: 'invalid', trainee: data, error: e };
                        }
                    }))
                    .on('data', ({ trainee, status, error }) => {
                        results.total++;
                        results[status]++;

                        if (status === 'ignored') {
                            logger.debug('Trainee ignored', trainee, {});
                        } else if (status === 'invalid') {
                            logger.error(`Trainee cannot be imported`, trainee, error);
                        } else {
                            logger.debug('New trainee inserted');
                        }
                    })
                    .on('finish', async () => {
                        try {
                            await db.collection('importTrainee').insertOne({
                                hash,
                                campaign,
                                date: new Date(),
                            });

                            return results.invalid === 0 ? resolve(results) : reject(results);

                        } catch (e) {
                            reject(e);
                        }
                    });

                }
            });
        }
    };
};
