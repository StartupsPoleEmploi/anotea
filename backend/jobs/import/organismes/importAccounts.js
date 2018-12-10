const uuid = require('node-uuid');
const _ = require('lodash');
const regions = require('../../../components/regions');

module.exports = async (db, logger) => {

    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    const buildAccountFromIntercarif = async organisme => {
        let { findCodeRegionByPostalCode } = regions(db);
        let adresse = organisme.lieux_de_formation ?
            organisme.lieux_de_formation.find(l => l.adresse.code_postal).adresse : organisme.adresse;
        let siret = `${parseInt(organisme.siret, 10)}`;

        let [codeRegion, kairosData] = await Promise.all([
            findCodeRegionByPostalCode(adresse.code_postal),
            db.collection('kairos_organismes').findOne({ siret }),
        ]);

        let document = {
            _id: parseInt(organisme.siret, 10),
            SIRET: parseInt(organisme.siret, 10),
            raisonSociale: organisme.raison_sociale,
            courriel: organisme.courriel,
            token: uuid.v4(),
            creationDate: new Date(),
            codeRegion: codeRegion,
            sources: ['intercarif'],
            numero: organisme.numero,
            lieux_de_formation: organisme.lieux_de_formation ? organisme.lieux_de_formation : [],
            meta: {
                siretAsString: siret,
            }
        };

        if (kairosData) {
            return Object.assign(document, {
                kairosCourriel: kairosData.emailRGC,
                codeRegion: kairosData.codeRegion,
            });
        }
        return document;
    };

    const buildAccountFromKairos = async data => {

        let siretAsInt = parseInt(data.siret, 10);

        return {
            _id: siretAsInt,
            SIRET: siretAsInt,
            raisonSociale: data.libelle,
            courriel: data.emailRGC,
            courriels: [data.emailRGC],
            kairosCourriel: data.emailRGC,
            token: uuid.v4(),
            creationDate: new Date(),
            codeRegion: data.codeRegion,
            sources: ['kairos'],
            numero: null,
            lieux_de_formation: [],
            meta: {
                siretAsString: data.siret,
            }
        };
    };

    const importIntercarifAccounts = async (sourceCollectionName, stats) => {

        let cursor = db.collection(sourceCollectionName).find({ courriel: { $ne: null } });

        while (await cursor.hasNext()) {
            const organisme = await cursor.next();
            try {
                let account = await buildAccountFromIntercarif(organisme);

                let results = await db.collection('organismes')
                .updateOne(
                    { _id: account._id },
                    {
                        $setOnInsert: _.omit(account, ['sources', 'numero', 'lieux_de_formation']),
                        $addToSet: {
                            sources: 'intercarif',
                            courriels: account.courriel,
                        },
                        $set: {
                            updateDate: new Date(),
                            ..._.pick(account, ['numero', 'lieux_de_formation'])
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
                logger.error(`Account cannot be imported from ${sourceCollectionName}`, JSON.stringify(organisme, null, 2), e);
            }
        }
    };

    const importMissingKairosAccounts = async stats => {

        let cursor = db.collection('kairos_organismes').find();

        while (await cursor.hasNext()) {
            const data = await cursor.next();
            try {
                let account = await buildAccountFromKairos(data);
                let count = await db.collection('organismes').countDocuments({ _id: account._id });

                if (count === 0) {
                    await db.collection('organismes').insertOne(account);
                    stats.created++;
                    stats.total++;
                }
            } catch (e) {
                stats.invalid++;
                logger.error(`Account cannot be imported from kairos`, JSON.stringify(data, null, 2), e);
            }
        }
    };

    await importIntercarifAccounts('intercarif_organismes_responsables', stats);
    await importIntercarifAccounts('intercarif_organismes_formateurs', stats);
    await importMissingKairosAccounts(stats);

    return stats;

};
