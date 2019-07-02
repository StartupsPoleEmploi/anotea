const uuid = require('node-uuid');
const _ = require('lodash');

module.exports = async (db, logger) => {

    let stats = {
        total: 0,
        updated: 0,
        invalid: 0,
    };

    let cursor = db.collection('kairos').find();
    while (await cursor.hasNext()) {
        const organisme = await cursor.next();
        stats.total++;

        try {
            let id = parseInt(organisme.siret, 10);
            let account = await db.collection('accounts').findOne({ _id: id });

            let results = await db.collection('accounts').updateOne(
                { _id: id },
                {
                    $setOnInsert: {
                        _id: id,
                        profile: 'organisme',
                        SIRET: id,
                        raisonSociale: organisme.libelle,
                        courriel: organisme.emailRGC,
                        token: uuid.v4(),
                        creationDate: new Date(),
                        numero: null,
                        lieux_de_formation: [],
                    },
                    $addToSet: {
                        ...(organisme.emailRGC ? { courriels: organisme.emailRGC } : {}),
                        sources: 'kairos',
                    },
                    $set: {
                        codeRegion: organisme.codeRegion,
                        ...(_.get(account, 'kairosCourriel') ? {} : { 'kairosCourriel': organisme.emailRGC }),
                        ...(_.get(account, 'meta.kairos') ? {} : { 'meta.kairos.eligible': false }),
                        ...(_.get(account, 'meta.siretAsString') ? {} : { 'meta.siretAsString': organisme.siret }),
                    },
                }
                , { upsert: true });

            if (results.result.nModified === 1) {
                stats.updated++;
            }

        } catch (e) {
            stats.invalid++;
            logger.error(`Organisme cannot be synchronized with kairos`, JSON.stringify(organisme, null, 2), e);
        }
    }

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
