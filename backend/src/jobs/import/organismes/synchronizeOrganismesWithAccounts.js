const uuid = require('node-uuid');
const _ = require('lodash');

module.exports = async (db, logger, regions) => {

    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    const findRegion = data => {
        let { findRegionByPostalCode } = regions;
        let error = null;
        let lieuxFieldName = 'lieux_de_formation';

        if (data.adresse) {
            //organisme responsable
            try {
                return findRegionByPostalCode(data.adresse.code_postal);
            } catch (e) {
                lieuxFieldName = 'organisme_formateurs.lieux_de_formation';
                error = e;
            }
        }

        let region = (_.get(data, lieuxFieldName) || []).reduce((acc, lieu) => {
            if (!acc) {
                try {
                    acc = findRegionByPostalCode(lieu.adresse.code_postal);
                } catch (e) {
                    error = e;
                }
            }
            return acc;
        }, null);

        if (!region) {
            throw error;
        }
        return region;
    };

    const buildAccountFromIntercarif = async data => {

        let siret = `${parseInt(data.siret, 10)}`;
        let kairos = await db.collection('kairos_organismes').findOne({ siret });

        let document = {
            _id: parseInt(data.siret, 10),
            SIRET: parseInt(data.siret, 10),
            raisonSociale: data.raison_sociale,
            courriel: data.courriel,
            courriels: data.courriel ? [data.courriel] : [],
            token: uuid.v4(),
            creationDate: new Date(),
            codeRegion: findRegion(data).codeRegion,
            sources: ['intercarif'],
            profile: 'organisme',
            numero: data.numero,
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

    const synchronizeAccounts = async (sourceCollectionName, stats) => {

        let cursor = db.collection(sourceCollectionName).find();

        while (await cursor.hasNext()) {
            const data = await cursor.next();
            try {
                let organisme = await buildAccountFromIntercarif(data);

                let results = await db.collection('accounts')
                .updateOne(
                    { _id: organisme._id },
                    {
                        $setOnInsert: _.omit(organisme, ['courriels', 'sources', 'numero', 'lieux_de_formation', 'profile']),
                        $addToSet: {
                            courriels: organisme.courriel,
                            sources: organisme.sources[0],
                        },
                        $set: {
                            profile: 'organisme',
                            numero: organisme.numero,
                            lieux_de_formation: organisme.lieux_de_formation,
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
                logger.error(`Organisme cannot be imported from ${sourceCollectionName}`, JSON.stringify(data, null, 2), e);
            }
        }
    };

    const addMissingAccountsFromKairos = async stats => {

        let cursor = db.collection('kairos_organismes').find();

        while (await cursor.hasNext()) {
            const data = await cursor.next();
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
        }
    };

    await synchronizeAccounts('intercarif_organismes_responsables', stats);
    await synchronizeAccounts('intercarif_organismes_formateurs', stats);
    await addMissingAccountsFromKairos(stats);

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
