const uuid = require('node-uuid');
const { writeObject, pipeline } = require('../../../../core/utils/stream-utils');
const getOrganismesFromKairosCSV = require('./kairos/getOrganismesFromKairosCSV');

module.exports = async (db, logger, file) => {

    let stats = {
        total: 0,
        updated: 0,
        invalid: 0,
    };

    await pipeline([
        getOrganismesFromKairosCSV(file),
        writeObject(async kairos => {
            stats.total++;

            try {
                let siret = kairos.siret;
                let courriel = kairos.emailRGC;

                let results = await db.collection('accounts').updateOne(
                    { siret },
                    {
                        $setOnInsert: {
                            profile: 'organisme',
                            siret,
                            raison_sociale: kairos.libelle,
                            codeRegion: kairos.codeRegion,
                            token: uuid.v4(),
                            creationDate: new Date(),
                            lieux_de_formation: [],
                            courriel,
                        },
                        $addToSet: {
                            sources: 'kairos',
                            ...(courriel ? { courriels: { courriel, source: 'kairos' } } : {}),
                        },
                    }
                    , { upsert: true }
                );

                if (results.result.nModified === 1) {
                    stats.updated++;
                }
            } catch (e) {
                stats.invalid++;
                logger.error(`Organisme cannot be synchronized with kairos`, e);
            }
        })
    ]);

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
