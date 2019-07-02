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
        const kairos = await cursor.next();
        stats.total++;

        try {
            let id = parseInt(kairos.siret, 10);
            let account = await db.collection('accounts').findOne({ _id: id });

            let kairosCourriel = kairos.emailRGC;
            let results = await db.collection('accounts').updateOne(
                { _id: id },
                {
                    $setOnInsert: {
                        _id: id,
                        SIRET: id,
                        raisonSociale: kairos.libelle,
                        codeRegion: kairos.codeRegion,
                        courriel: kairosCourriel,
                        token: uuid.v4(),
                        creationDate: new Date(),
                        numero: null,
                        lieux_de_formation: [],
                    },
                    $addToSet: {
                        ...(kairosCourriel ? { courriels: kairosCourriel } : {}),
                        sources: 'kairos',
                    },
                    $set: {
                        profile: 'organisme',
                        ...(_.get(account, 'kairosCourriel') && kairosCourriel ? {} : { 'kairosCourriel': kairosCourriel }),
                        ...(_.get(account, 'meta.kairos') ? {} : { 'meta.kairos.eligible': false }),
                        ...(_.get(account, 'meta.siretAsString') ? {} : { 'meta.siretAsString': kairos.siret }),
                    },
                }
                , { upsert: true });

            if (results.result.nModified === 1) {
                stats.updated++;
            }

        } catch (e) {
            stats.invalid++;
            logger.error(`Organisme cannot be synchronized with kairos`, JSON.stringify(kairos, null, 2), e);
        }
    }

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
