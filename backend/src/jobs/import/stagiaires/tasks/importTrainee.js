const fs = require('fs');
const md5File = require('md5-file/promise');
const validateTrainee = require('./utils/validateTrainee');
const { transformObject, writeObject, ignoreFirstLine, pipeline, parseCSV } = require('../../../../common/utils/stream-utils');
const { getCampaignDate, getCampaignName } = require('./utils/utils');

module.exports = async (db, logger, file, handler, filters = {}) => {

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

        if (await db.collection('importTrainee').findOne({ hash, filters })) {
            logger.info(`CSV file ${file} already imported`);
            return resolve(stats);
        } else {

            logger.info(`Import des stagiaires pour la campagne ${handler.name}/${campaign.name}...`);

            await pipeline([
                fs.createReadStream(file),
                parseCSV(handler.csvOptions),
                ignoreFirstLine(),
                transformObject(record => {
                    let keys = Object.keys(record);
                    return keys.reduce((acc, key) => {
                        let value = record[key];
                        return {
                            ...acc,
                            [key]: value === 'NULL' ? '' : value,
                        };
                    }, {});
                }),
                writeObject(async record => {
                    try {
                        stats.total++;
                        let trainee = await handler.buildTrainee(record, campaign);

                        if (await shouldBeImported(trainee)) {
                            await validateTrainee(trainee);
                            await db.collection('trainee').insertOne(trainee);
                            stats.imported++;
                            logger.debug('New trainee inserted');
                        } else {
                            stats.ignored++;
                            logger.debug('Trainee ignored', trainee, {});
                        }
                    } catch (e) {
                        stats.invalid++;
                        logger.error(`Trainee cannot be imported`, record, e);
                    }
                }, { parallel: 25 })
            ]);

            await db.collection('importTrainee').insertOne({
                hash,
                campaign: campaign.name,
                campaignDate: campaign.date,
                file,
                filters,
                stats: stats,
                date: new Date(),
            });

            return stats.invalid === 0 ? resolve(stats) : reject(stats);
        }
    });
};
