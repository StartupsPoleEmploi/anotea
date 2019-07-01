const uuid = require('node-uuid');
const _ = require('lodash');
const getOrganismesResponsables = require('./utils/getOrganismesResponsables');
const findRegion = require('./utils/findRegion');

module.exports = async (db, logger, regions) => {

    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    const buildAccount = async data => {

        let siret = `${parseInt(data.siret, 10)}`;
        let kairos = await db.collection('kairos_organismes').findOne({ siret });
        let region = findRegion(regions, data);

        let document = {
            _id: parseInt(data.siret, 10),
            SIRET: parseInt(data.siret, 10),
            raisonSociale: data.raison_sociale,
            numero: data.numero,
            codeRegion: region.codeRegion,
            courriel: data.courriel,
            courriels: data.courriel ? [data.courriel] : [],
            token: uuid.v4(),
            creationDate: new Date(),
            sources: ['intercarif'],
            profile: 'organisme',
            lieux_de_formation: data.lieux_de_formation ? data.lieux_de_formation : [],
            meta: {
                siretAsString: siret,
            }
        };

        if (kairos) {
            return _.merge(document, {
                kairosCourriel: kairos.emailRGC,
                codeRegion: kairos.codeRegion,
                meta: {
                    kairos: {
                        eligible: false,
                    }
                },
            });
        }
        return document;
    };

    const synchronizeAccount = async data => {

        try {
            let account = await buildAccount(data);

            let results = await db.collection('accounts')
            .updateOne(
                { _id: account._id },
                {
                    $setOnInsert: _.omit(account, ['courriels', 'sources', 'numero', 'lieux_de_formation', 'profile']),
                    $addToSet: {
                        courriels: account.courriel,
                        sources: account.sources[0],
                    },
                    $set: {
                        profile: 'organisme',
                        numero: account.numero,
                        lieux_de_formation: account.lieux_de_formation,
                        updateDate: new Date(),
                    },
                },
                { upsert: true }
            );

            if (results.result.nModified === 1) {
                stats.updated++;
            } else {
                stats.created++;
            }
            stats.total++;

        } catch (e) {
            stats.invalid++;
            logger.error(`Organisme cannot be imported`, JSON.stringify(data, null, 2), e);
        }
    };

    let cursor = getOrganismesResponsables(db);
    while (await cursor.hasNext()) {
        const data = await cursor.next();

        await Promise.all([
            synchronizeAccount(data),
            ...(data ? data.organisme_formateurs.map(of => synchronizeAccount(of)) : [])
        ]);
    }

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
