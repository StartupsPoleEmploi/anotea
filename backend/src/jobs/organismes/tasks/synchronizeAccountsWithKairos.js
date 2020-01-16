const uuid = require('node-uuid');
const _ = require('lodash');
const { writeObject, pipeline } = require('../../../core/utils/stream-utils');
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
                let account = await db.collection('accounts').findOne({ siret });
                let courriel = kairos.emailRGC;

                let results = await db.collection('accounts').updateOne(
                    { siret },
                    {
                        $setOnInsert: {
                            siret,
                            raisonSociale: kairos.libelle,
                            codeRegion: kairos.codeRegion,
                            token: uuid.v4(),
                            creationDate: new Date(),
                            lieux_de_formation: [],
                            courriel,
                        },
                        $addToSet: {
                            courriels: { courriel, source: 'kairos' },
                            sources: 'kairos',
                        },
                        $set: {
                            profile: 'organisme',
                            ...(_.get(account, 'meta.kairos') ? {} : { 'meta.kairos.eligible': false }),
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
