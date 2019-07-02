const uuid = require('node-uuid');

module.exports = async (db, logger) => {

    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    let cursor = db.collection('kairos').find();
    while (await cursor.hasNext()) {
        const organisme = await cursor.next();

        try {
            let id = parseInt(organisme.siret, 10);
            let count = await db.collection('accounts').countDocuments({ _id: id });

            if (count === 0) {
                await db.collection('accounts').insertOne({
                    _id: id,
                    SIRET: id,
                    raisonSociale: organisme.libelle,
                    courriel: organisme.emailRGC,
                    courriels: [organisme.emailRGC],
                    kairosCourriel: organisme.emailRGC,
                    token: uuid.v4(),
                    creationDate: new Date(),
                    codeRegion: organisme.codeRegion,
                    sources: ['kairos'],
                    profile: 'organisme',
                    numero: null,
                    lieux_de_formation: [],
                    meta: {
                        siretAsString: organisme.siret,
                        kairos: {
                            eligible: false,
                        }
                    }
                });
                stats.created++;
                stats.total++;
            }
        } catch (e) {
            stats.invalid++;
            logger.error(`Organisme cannot be imported from kairos`, JSON.stringify(organisme, null, 2), e);
        }
    }

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
