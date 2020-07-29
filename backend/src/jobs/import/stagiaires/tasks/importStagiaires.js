const fs = require('fs');
const bz2 = require('unbzip2-stream');
const md5File = require('md5-file');
const validateStagiaire = require('./utils/validateStagiaire');
const shouldBeImported = require('./utils/shouldBeImported');
const hasNotBeenImported = require('./utils/hasNotBeenImported');
const { transformObject, writeObject, ignoreFirstLine, pipeline, parseCSV } = require('../../../../core/utils/stream-utils');
const { getCampaignDate, getCampaignName, sanitizeCsvLine } = require('./utils/utils');

module.exports = async (db, logger, file, handler, filters = {}, options = {}) => {

    let hash = await md5File(file);
    let campaign = {
        name: getCampaignName(file),
        date: getCampaignDate(file),
    };

    let stats = {
        total: 0,
        imported: 0,
        ignored: 0,
        invalid: 0,
    };

    await pipeline([
        fs.createReadStream(file),
        ...(options.unpack ? [bz2()] : []),
        parseCSV(handler.csvOptions),
        ignoreFirstLine(),
        transformObject(sanitizeCsvLine),
        writeObject(async record => {
            try {
                stats.total++;
                let stagiaire = await handler.buildStagiaire(record, campaign);

                if (await shouldBeImported(db, handler, filters, stagiaire) && await hasNotBeenImported(db, stagiaire)) {

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

    await db.collection('jobs').insertOne({
        type: 'import-stagiaires',
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
