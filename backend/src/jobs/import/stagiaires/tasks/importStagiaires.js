const fs = require('fs');
const md5File = require('md5-file/promise');
const md5 = require('md5');
const validateStagiaire = require('./utils/validateStagiaire');
const { transformObject, writeObject, ignoreFirstLine, pipeline, parseCSV } = require('../../../../core/utils/stream-utils');
const { flattenKeys } = require('../../../../core/utils/object-utils');
const { getCampaignDate, getCampaignName, sanitizeCsvLine } = require('./utils/utils');

module.exports = async (db, logger, file, handler, filters = {}) => {

    let hash = await md5File(file);
    let campaign = {
        name: getCampaignName(file),
        date: getCampaignDate(file),
    };

    const isFiltered = stagiaire => {
        if (filters.codeRegion) {
            return filters.codeRegion === stagiaire.codeRegion;
        }
        if (filters.codeFinanceur) {
            return stagiaire.training.codeFinanceur.includes(filters.codeFinanceur);
        }
        return true;
    };

    const hasNotBeenAlreadyImportedOrRemoved = async stagiaire => {
        let email = stagiaire.trainee.email;
        let [countStagiaires, countOptOut] = await Promise.all([
            db.collection('stagiaires').countDocuments(flattenKeys(handler.getKey(stagiaire))),
            db.collection('optOut').countDocuments({
                'md5': md5(email),
            })
        ]);

        return countStagiaires === 0 && countOptOut === 0;
    };


    let stats = {
        total: 0,
        imported: 0,
        ignored: 0,
        invalid: 0,
    };

    if (await db.collection('importTrainee').findOne({ campaign: campaign.name })) {
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
                let stagiaire = await handler.buildStagiaire(record, campaign);

                if (isFiltered(stagiaire) && handler.shouldBeImported(stagiaire) &&
                    await hasNotBeenAlreadyImportedOrRemoved(stagiaire)) {

                    await validateStagiaire(stagiaire);
                    await db.collection('stagiaires').insertOne(stagiaire);
                    stats.imported++;
                    logger.debug('New stagiaire inserted');
                } else {
                    stats.ignored++;
                    logger.debug('Stagiaire ignored', stagiaire, {});
                }
            } catch (e) {
                stats.invalid++;
                logger.error(`Stagiaire cannot be imported`, record, e);
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
