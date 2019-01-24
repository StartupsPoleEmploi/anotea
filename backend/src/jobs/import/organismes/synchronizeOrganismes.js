const uuid = require('node-uuid');
const _ = require('lodash');
const regions = require('../../../common/components/regions');

module.exports = async (db, logger) => {

    let stats = {
        total: 0,
        updated: 0,
        created: 0,
        invalid: 0,
    };

    const buildOrganismeFromIntercarif = async data => {
        let { findCodeRegionByPostalCode } = regions(db);
        let adresse = data.lieux_de_formation ?
            data.lieux_de_formation.find(l => l.adresse.code_postal).adresse : data.adresse;
        let siret = `${parseInt(data.siret, 10)}`;

        let [codeRegion, kairosData] = await Promise.all([
            findCodeRegionByPostalCode(adresse.code_postal),
            db.collection('kairos_organismes').findOne({ siret }),
        ]);

        let document = {
            _id: parseInt(data.siret, 10),
            SIRET: parseInt(data.siret, 10),
            raisonSociale: data.raison_sociale,
            courriel: data.courriel,
            courriels: data.courriel ? [data.courriel] : [],
            token: uuid.v4(),
            creationDate: new Date(),
            codeRegion: codeRegion,
            sources: ['intercarif'],
            numero: data.numero,
            lieux_de_formation: data.lieux_de_formation ? data.lieux_de_formation : [],
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

    const buildOrganismeFromKairos = async data => {

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

    const synchronizeOrganismes = async (sourceCollectionName, stats) => {

        let cursor = db.collection(sourceCollectionName).find();

        while (await cursor.hasNext()) {
            const data = await cursor.next();
            try {
                let organisme = await buildOrganismeFromIntercarif(data);

                let results = await db.collection('account')
                .updateOne(
                    { _id: organisme._id },
                    {
                        $setOnInsert: _.omit(organisme, ['courriels', 'sources', 'numero', 'lieux_de_formation']),
                        $addToSet: {
                            courriels: organisme.courriel,
                            sources: organisme.sources[0],
                        },
                        $set: {
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

    const addMissingOrganismesFromKairos = async stats => {

        let cursor = db.collection('kairos_organismes').find();

        while (await cursor.hasNext()) {
            const data = await cursor.next();
            try {
                let organisme = await buildOrganismeFromKairos(data);
                let count = await db.collection('account').countDocuments({ _id: organisme._id });

                if (count === 0) {
                    await db.collection('account').insertOne(organisme);
                    stats.created++;
                    stats.total++;
                }
            } catch (e) {
                stats.invalid++;
                logger.error(`Organisme cannot be imported from kairos`, JSON.stringify(data, null, 2), e);
            }
        }
    };

    await synchronizeOrganismes('intercarif_organismes_responsables', stats);
    await synchronizeOrganismes('intercarif_organismes_formateurs', stats);
    await addMissingOrganismesFromKairos(stats);

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
