const uuid = require('node-uuid');
const getOrganismesResponsables = require('./synchronizeAccounts/getOrganismesResponsables');
const findRegion = require('./synchronizeAccounts/findRegion');

module.exports = async (db, logger, regions) => {

    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    const createUpdateQuery = (organisme, options = {}) => {

        let region = findRegion(regions, organisme);

        let query = {
            $setOnInsert: {
                _id: parseInt(organisme.siret, 10),
                SIRET: parseInt(organisme.siret, 10),
                raisonSociale: organisme.raison_sociale,
                codeRegion: region.codeRegion,
                courriel: organisme.courriel,
                token: uuid.v4(),
                creationDate: new Date(),
                ...(options.kairos ? { kairosCourriel: options.kairos.emailRGC } : {}),
                ...(options.kairos ? { codeRegion: options.kairos.codeRegion } : {}),
                meta: {
                    siretAsString: organisme.siret,
                    ...(options.kairos ? { kairos: { eligible: false } } : {}),
                }
            },
            $addToSet: {
                courriels: organisme.courriel ? organisme.courriel : [],
                sources: 'intercarif',
            },
            $set: {
                profile: 'organisme',
                updateDate: new Date(),
                numero: organisme.numero,
                lieux_de_formation: organisme.lieux_de_formation ? organisme.lieux_de_formation :
                    organisme.organisme_formateurs
                    .filter(of => of.siret === organisme.siret)
                    .map(of => of.lieux_de_formation),
            },
        };

        if (organisme.organisme_formateurs) {
            query.$set.organismeFormateurs = organisme.organisme_formateurs.map(of => {
                return {
                    siret: of.siret,
                    numero: of.numero,
                    raisonSociale: of.raison_sociale,
                    lieux_de_formation: of.lieux_de_formation,
                };
            });
        }

        return query;
    };

    const synchronizeAccount = async organisme => {

        try {
            let kairos = await db.collection('kairos').findOne({ siret: organisme.siret });
            let updateQuery = await createUpdateQuery(organisme, { kairos });

            let results = await db.collection('accounts')
            .updateOne({ _id: updateQuery.$setOnInsert._id }, updateQuery, { upsert: true });

            if (results.result.nModified === 1) {
                stats.updated++;
            } else {
                stats.created++;
            }
            stats.total++;

        } catch (e) {
            stats.invalid++;
            logger.error(`Organisme cannot be imported`, JSON.stringify(organisme, null, 2), e);
        }
    };

    let cursor = getOrganismesResponsables(db);
    while (await cursor.hasNext()) {
        const organisme = await cursor.next();

        await Promise.all([
            synchronizeAccount(organisme),
            ...organisme.organisme_formateurs.map(of => synchronizeAccount(of))
        ]);
    }

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
