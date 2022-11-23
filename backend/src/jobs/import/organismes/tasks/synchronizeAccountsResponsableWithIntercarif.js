const uuid = require('node-uuid');
const _ = require('lodash');
const { promiseAll } = require('../../../job-utils');

module.exports = async (db, logger) => {

    let stats = {
        total: 0,
        updated: 0,
        invalid: 0,
    };

    const getOrganismesFromIntercarif = async () => {
        let accumulator = {};

        let cursor = db.collection('intercarif').find().project({
            'organisme_formation_responsable': 1
        });
        while (await cursor.hasNext()) {
            let intercarif = await cursor.next();
            const organisme_formation_responsable = intercarif.organisme_formation_responsable;

            if (organisme_formation_responsable.siret_organisme_formation.siret !== '0') {
                let siret = organisme_formation_responsable.siret_organisme_formation.siret;
                let hasCourriel = !!organisme_formation_responsable?.coordonnees_organisme?.coordonnees?.courriel;
                let previous = accumulator[siret];

                if (previous) {
                    accumulator[siret] = {
                        organisme_formation_responsable: _.merge({}, previous.organisme_formation_responsable, organisme_formation_responsable),
                        courriels: _.unionWith(
                            previous.courriels,
                            hasCourriel ? [
                                {
                                    courriel: organisme_formation_responsable.coordonnees_organisme.coordonnees.courriel,
                                    source: 'intercarif',
                                }
                            ] : [],
                            _.isEqual
                        ),
                        region: previous.region,
                    };
                } else {
                    accumulator[siret] = {
                        organisme_formation_responsable: organisme_formation_responsable,
                        courriels: hasCourriel ? [{
                            courriel: organisme_formation_responsable.coordonnees_organisme.coordonnees.courriel,
                            source: 'intercarif',
                        }] : [],
                        region: findCodeRegionResponsable(organisme_formation_responsable),
                    };
                }
            }
        }
        return Object.values(accumulator);
    };

    const findCodeRegionResponsable = organisme_formation_responsable => {
        if (!organisme_formation_responsable?.coordonnees_organisme?.coordonnees?.adresse?.region) {
            throw new Error(`Unable to find region for organisme ${organisme_formation_responsable.siret_organisme_formation.siret}`);
        }

        return organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse.region;
    };

    const synchronizeAccount = async data => {

        try {
            stats.total++;

            let responsable = data.organisme_formation_responsable;
            let siret = responsable.siret_organisme_formation.siret;

            let results = await db.collection('accounts').updateOne(
                { siret },
                {
                    $setOnInsert: {
                        profile: 'organisme',
                        siret,
                        courriel: data.courriels.length > 0 ? data.courriels[0].courriel : null,
                        token: uuid.v4(),
                        creationDate: new Date(),
                        lieux_de_formation: [],
                    },
                    $addToSet: {
                        sources: 'intercarif',
                        courriels: { $each: data.courriels },
                    },
                    $set: {
                        raison_sociale: responsable.raison_sociale,
                        codeRegion: data.region,
                    },
                },
                { upsert: true }
            );

            if (results.result.nModified === 1) {
                stats.updated++;
            }

            return results;

        } catch (e) {
            stats.invalid++;
            logger.error(`Organisme cannot be synchronized with intercarif`, JSON.stringify(data, null, 2), e);
            return null;
        }
    };

    let organismes = await getOrganismesFromIntercarif();
    await promiseAll(organismes, organisme => synchronizeAccount(organisme), { batchSize: 50 });

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
