const uuid = require('node-uuid');
const _ = require('lodash');

const flatten = array => [].concat.apply([], array);

module.exports = async (db, logger, regions) => {

    let { findRegionByPostalCode } = regions;
    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    const findRegion = data => {
        let error = null;
        let lieuxDeFormation = data.lieux_de_formation;

        if (data.organisme_formateurs) {
            //organisme responsable
            try {
                return findRegionByPostalCode(data.adresse.code_postal);
            } catch (e) {
                lieuxDeFormation = flatten(data.organisme_formateurs.map(o => o.lieux_de_formation));
                error = e;
            }
        }

        let region = lieuxDeFormation.reduce((acc, lieu) => {
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

    const buildAccount = async data => {

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

    const synchronizeAccounts = async sourceCollectionName => {

        let cursor = db.collection(sourceCollectionName).find();

        while (await cursor.hasNext()) {
            const data = await cursor.next();
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
                logger.error(`Organisme cannot be imported from ${sourceCollectionName}`, JSON.stringify(data, null, 2), e);
            }
        }
    };

    const addMissingAccountsFromKairos = async () => {

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

    await synchronizeAccounts('intercarif_organismes_responsables');
    await synchronizeAccounts('intercarif_organismes_formateurs');
    await addMissingAccountsFromKairos();

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
