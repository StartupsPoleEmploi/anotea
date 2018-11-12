const path = require('path');
const fs = require('fs');
const parse = require('csv-parse');
const md5File = require('md5-file/promise');
const validate = require('./traineeValidator');
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

            const shouldBeIgnored = async (trainee, filters) => {
                let notSameRegion = filters.codeRegion && filters.codeRegion !== trainee.codeRegion;
                let beforeSessionDate = filters.startDate && trainee.training.scheduledEndDate <= filters.startDate;
                let notSameCodeFinancer = filters.includeCodeFinancer &&
                    !trainee.training.codeFinanceur.includes(filters.includeCodeFinancer);
                let codeFinancerExcluded = filters.excludeCodeFinancer &&
                    trainee.training.codeFinanceur.includes(filters.excludeCodeFinancer);

                return notSameRegion || beforeSessionDate || codeFinancerExcluded || notSameCodeFinancer ||
                    !(await handler.shouldBeImported(trainee));
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

                            if (await shouldBeIgnored(trainee, filters)) {
                                return { status: 'ignored', trainee };
                            } else {
                                await validate(trainee);
                                await db.collection('trainee').save(trainee);
                                return { status: 'imported', trainee };
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
                            await db.collection('importTrainee').save({
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
