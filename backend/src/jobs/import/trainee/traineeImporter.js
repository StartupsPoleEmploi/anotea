const fs = require('fs');
const parse = require('csv-parse');
const md5File = require('md5-file/promise');
const validateTrainee = require('./validateTrainee');
const { transformObject } = require('../../../common/utils/stream-utils');
const { getCampaignDate, getCampaignName } = require('./utils');

module.exports = (db, logger) => {

    return {
        importTrainee: async (file, handler, filters = {}) => {

            let hash = await md5File(file);
            let campaign = {
                name: getCampaignName(file),
                date: getCampaignDate(file),
            };

            const shouldBeImported = async trainee => {
                let sameRegion = !filters.codeRegion || filters.codeRegion === trainee.codeRegion;
                let isAfter = !filters.since || trainee.training.scheduledEndDate > filters.since;

                return sameRegion && isAfter && await handler.shouldBeImported(trainee);
            };

            return new Promise(async (resolve, reject) => {

                let stats = {
                    total: 0,
                    imported: 0,
                    ignored: 0,
                    invalid: 0,
                };

                if (!filters.append && await db.collection('importTrainee').findOne({ hash, filters })) {
                    logger.info(`CSV file ${file} already imported`);
                    return resolve(stats);
                } else {

                    logger.info(`Trainee import ${handler.name}/${campaign.name}...`);

                    fs.createReadStream(file)
                    .pipe(parse(handler.csvOptions))
                    .pipe(transformObject(async data => {
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
                    }, { ignoreFirstLine: true }))
                    .on('data', ({ trainee, status, error }) => {
                        stats.total++;
                        stats[status]++;

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
                            if (!filters.append) {
                                await db.collection('importTrainee').insertOne({
                                    hash,
                                    campaign: campaign.name,
                                    campaignDate: campaign.date,
                                    file,
                                    filters,
                                    stats: stats,
                                    date: new Date(),
                                });
                            } else {
                                await db.collection('importTrainee').updateOne({ campaign: campaign.name }, {
                                    $inc: {
                                        'stats.imported': stats.imported,
                                        'stats.invalid': stats.invalid,
                                    }
                                });
                            }
                            return stats.invalid === 0 ? resolve(stats) : reject(stats);

                        } catch (e) {
                            reject(e);
                        }
                    });

                }
            });
        }
    };
};
