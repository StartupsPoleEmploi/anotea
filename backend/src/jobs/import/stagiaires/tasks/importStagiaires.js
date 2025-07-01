const fs = require('fs');
const bz2 = require('unbzip2-stream');
const md5File = require('md5-file');
const validateStagiaire = require('./utils/validateStagiaire');
const shouldBeImported = require('./utils/shouldBeImported');
const hasNotBeenImported = require('./utils/hasNotBeenImported');
const organismeResponsableAbsent = require('./utils/organismeResponsableAbsent');
const individuAbsent = require('./utils/individuAbsent');
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
        updated: 0,
        updatedDispositif: 0,
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

                const shouldStagiaireBeImported = await shouldBeImported(db, handler, filters, stagiaire) ;
                const hasNotStagiaireBeenImported = await hasNotBeenImported(db, stagiaire) ;

                if (shouldStagiaireBeImported && hasNotStagiaireBeenImported) {
                    await validateStagiaire(stagiaire);
                    await db.collection('stagiaires').insertOne(stagiaire);
                    stats.imported++;
                    logger.debug('New stagiaire inserted');
                } else if (shouldStagiaireBeImported && await organismeResponsableAbsent(db, stagiaire)) {
                    await validateStagiaire(stagiaire);
                    await db.collection('stagiaires').updateOne(
                        {refreshKey: stagiaire.refreshKey},
                        {
                            $set: {
                                "individu": stagiaire.individu,
                                "formation.action.organisme_responsable": stagiaire.formation.action.organisme_responsable,
                                "dispositifFinancement": stagiaire.dispositifFinancement,
                            }
                        }
                    );
                    stats.updated++;
                    logger.debug('Organisme responsable updated');
                } else if (shouldStagiaireBeImported && await individuAbsent(db, stagiaire)) {
                    await db.collection('stagiaires').updateOne(
                        {refreshKey: stagiaire.refreshKey},
                        {
                            $set: {
                                "individu": stagiaire.individu,
                                "dispositifFinancement": stagiaire.dispositifFinancement,
                            }
                        }
                    );
                    stats.updated++;
                } else if (shouldStagiaireBeImported && ("Autres_AFC" === stagiaire.dispositifFinancement || "FOAD" === stagiaire.dispositifFinancement)) {
                    await db.collection('stagiaires').updateOne(
                        {refreshKey: stagiaire.refreshKey},
                        {
                            $set: {
                                "dispositifFinancement": stagiaire.dispositifFinancement,
                            }
                        }
                    );
                    stats.updatedDispositif++;
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
