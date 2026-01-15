/* eslint-disable camelcase */
/* eslint-disable max-statements-per-line */
const uuid = require('uuid');
const _ = require('lodash');
const { promiseAll } = require('../../../job-utils');

module.exports = async (db, logger) => {

    let stats = {
        total: 0,
        updated: 0,
        invalid: 0,
    };

    const findCodeRegionResponsable = organisme_formation_responsable => {
        if (!organisme_formation_responsable ||
            !organisme_formation_responsable.coordonnees_organisme ||
            !organisme_formation_responsable.coordonnees_organisme.coordonnees ||
            !organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse ||
            !organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse.region) {
            return '11';
        }

        let lieu = organisme_formation_responsable.coordonnees_organisme.coordonnees.adresse.region;
        switch (lieu) {
            case '26': lieu = '27'; break;
            case '43': lieu = '27'; break;
            case '23': lieu = '28'; break;
            case '25': lieu = '28'; break;
            case '22': lieu = '32'; break;
            case '31': lieu = '32'; break;
            case '21': lieu = '44'; break;
            case '41': lieu = '44'; break;
            case '42': lieu = '44'; break;
            case '54': lieu = '75'; break;
            case '72': lieu = '75'; break;
            case '74': lieu = '75'; break;
            case '73': lieu = '76'; break;
            case '91': lieu = '76'; break;
            case '82': lieu = '84'; break;
            case '83': lieu = '84'; break;
            case '93': lieu = '93'; break;
            case '94': lieu = '94'; break;
            default: break;
        }

        return lieu;
    };

    const getOrganismesFromIntercarif = async () => {
        let accumulator = {};

        let cursor = db.collection('intercarif').find().project({
            'organisme_formation_responsable': 1
        });
        while (await cursor.hasNext()) {
            let intercarif = await cursor.next();
            const organisme_formation_responsable = intercarif.organisme_formation_responsable;

            if (organisme_formation_responsable
                && organisme_formation_responsable.siret_organisme_formation
                && organisme_formation_responsable.siret_organisme_formation.siret !== '0') {
                let siret = organisme_formation_responsable.siret_organisme_formation.siret;
                let hasCourriel = undefined;
                if (organisme_formation_responsable
                    && organisme_formation_responsable.coordonnees_organisme
                    && organisme_formation_responsable.coordonnees_organisme.coordonnees
                    && organisme_formation_responsable.coordonnees_organisme.coordonnees.courriel)
                    hasCourriel = !!(organisme_formation_responsable.coordonnees_organisme.coordonnees.courriel);

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

            if (results.modifiedCount === 1) {
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

    return stats.invalid < 1000 ? Promise.resolve(stats) : Promise.reject(stats);
};
