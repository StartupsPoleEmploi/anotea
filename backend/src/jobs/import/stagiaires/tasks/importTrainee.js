const fs = require('fs');
const md5File = require('md5-file/promise');
const md5 = require('md5');
const validateTrainee = require('./utils/validateTrainee');
const { transformObject, writeObject, ignoreFirstLine, pipeline, parseCSV } = require('../../../../common/utils/stream-utils');
const { flattenKeys } = require('../../../../common/utils/object-utils');
const { getCampaignDate, getCampaignName, sanitizeCsvLine } = require('./utils/utils');

module.exports = async (db, logger, file, handler, filters = {}) => {

    let hash = await md5File(file);
    let campaign = {
        name: getCampaignName(file),
        date: getCampaignDate(file),
    };

    const isFiltered = trainee => {
        if (filters.codeRegion) {
            return filters.codeRegion === trainee.codeRegion;
        }
        if (filters.codeFinanceur) {
            return trainee.training.codeFinanceur.includes(filters.codeFinanceur);
        }
        return true;
    };

    const hasNotBeenAlreadyImportedOrRemoved = async trainee => {
        let email = trainee.trainee.email;
        let [countTrainee, countOptOut] = await Promise.all([
            db.collection('trainee').countDocuments(flattenKeys(handler.getKey(trainee))),
            db.collection('optOut').countDocuments({
                'md5': md5(email),
            })
        ]);

        return countTrainee === 0 && countOptOut === 0;
    };


    let stats = {
        total: 0,
        imported: 0,
        ignored: 0,
        invalid: 0,
    };

    if (await db.collection('importTrainee').findOne({ hash, filters })) {
        logger.info(`CSV file ${file} already imported`);
        return stats;
    }

    await pipeline([
        fs.createReadStream(file),
        parseCSV(handler.csvOptions),
        ignoreFirstLine(),
        transformObject(sanitizeCsvLine),
        writeObject(async record => {
            try {
                stats.total++;
                let trainee = await handler.buildTrainee(record, campaign);

                if (isFiltered(trainee) && handler.shouldBeImported(trainee) &&
                    await hasNotBeenAlreadyImportedOrRemoved(trainee)) {

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

    return stats;

};
