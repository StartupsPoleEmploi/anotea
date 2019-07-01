const uuid = require('node-uuid');

module.exports = async (db, logger) => {

    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    const addMissingAccountFromKairos = async data => {

        try {
            let organisme = {
                _id: parseInt(data.siret, 10),
                SIRET: parseInt(data.siret, 10),
                raisonSociale: data.libelle,
                courriel: data.emailRGC,
                courriels: [data.emailRGC],
                kairosCourriel: data.emailRGC,
                token: uuid.v4(),
                creationDate: new Date(),
                codeRegion: data.codeRegion,
                sources: ['kairos'],
                profile: 'organisme',
                numero: null,
                lieux_de_formation: [],
                meta: {
                    siretAsString: data.siret,
                    kairos: {
                        eligible: false,
                    }
                }
            };

            let count = await db.collection('accounts').countDocuments({ _id: organisme._id });

            if (count === 0) {
                await db.collection('accounts').insertOne(organisme);
                stats.created++;
                stats.total++;
            }
        } catch (e) {
            stats.invalid++;
            logger.error(`Organisme cannot be imported from kairos`, JSON.stringify(data, null, 2), e);
        }
    };

    let cursor = db.collection('kairos').find();
    while (await cursor.hasNext()) {
        const data = await cursor.next();
        await addMissingAccountFromKairos(data);
    }

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
