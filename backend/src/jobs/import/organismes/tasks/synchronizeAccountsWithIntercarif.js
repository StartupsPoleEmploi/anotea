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
            'actions.lieu_de_formation': 1,
            'actions.organisme_formateur': 1
        });
        while (await cursor.hasNext()) {
            let intercarif = await cursor.next();

            intercarif.actions
            .filter(action => {
                return action.lieu_de_formation.coordonnees.adresse  && action.organisme_formateur && action.organisme_formateur.siret_formateur && action.organisme_formateur.siret_formateur.siret !== '0';
            })
            .forEach(action => {
                let siret = action.organisme_formateur.siret_formateur.siret;
                let hasCourriel = !!_.get(action, 'organisme_formateur.contact_formateur');
                let previous = accumulator[siret];

                if (previous) {
                    accumulator[siret] = {
                        organisme_formateur: _.merge({}, previous.organisme_formateur, action.organisme_formateur),
                        courriels: _.unionWith(
                            previous.courriels,
                            hasCourriel ? [
                                {
                                    courriel: action.organisme_formateur.contact_formateur.coordonnees.courriel,
                                    source: 'intercarif',
                                }
                            ] : [],
                            _.isEqual
                        ),
                        lieux_de_formation: _.unionWith(
                            previous.lieux_de_formation,
                            [action.lieu_de_formation],
                            (v1, v2) => v1.coordonnees.adresse.codepostal === v2.coordonnees.adresse.codepostal
                        ),
                    };
                } else {
                    accumulator[siret] = {
                        organisme_formateur: action.organisme_formateur,
                        courriels: hasCourriel ? [{
                            courriel: action.organisme_formateur.contact_formateur.coordonnees.courriel,
                            source: 'intercarif',
                        }] : [],
                        lieux_de_formation: [action.lieu_de_formation],
                    };
                }
            });
        }
        return Object.values(accumulator);
    };

    const findCodeRegion = data => {

        let lieu = data.lieux_de_formation.find(lieu => lieu.coordonnees.adresse.region);

        if (!lieu) {
            return '11';
        }

        let codeRegion = lieu.coordonnees.adresse.region;

        switch (codeRegion) {
            case '26': codeRegion = '27'; break;
            case '43': codeRegion = '27'; break;
            case '23': codeRegion = '28'; break;
            case '25': codeRegion = '28'; break;
            case '22': codeRegion = '32'; break;
            case '31': codeRegion = '32'; break;
            case '21': codeRegion = '44'; break;
            case '41': codeRegion = '44'; break;
            case '42': codeRegion = '44'; break;
            case '54': codeRegion = '75'; break;
            case '72': codeRegion = '75'; break;
            case '74': codeRegion = '75'; break;
            case '73': codeRegion = '76'; break;
            case '91': codeRegion = '76'; break;
            case '82': codeRegion = '84'; break;
            case '83': codeRegion = '84'; break;
            case '93': codeRegion = '93'; break;
            case '94': codeRegion = '94'; break;
        }

        return codeRegion;
    };

    const synchronizeAccount = async data => {

        try {
            stats.total++;

            let formateur = data.organisme_formateur;
            let siret = formateur.siret_formateur.siret;

            let results = await db.collection('accounts').updateOne(
                { siret },
                {
                    $setOnInsert: {
                        profile: 'organisme',
                        siret,
                        courriel: data.courriels.length > 0 ? data.courriels[0].courriel : null,
                        token: uuid.v4(),
                        creationDate: new Date(),
                    },
                    $addToSet: {
                        sources: 'intercarif',
                        courriels: { $each: data.courriels },
                    },
                    $set: {
                        lieux_de_formation: _.sortBy(data.lieux_de_formation.map(lieu => {
                            return {
                                nom: lieu.coordonnees.nom,
                                adresse: {
                                    code_postal: lieu.coordonnees.adresse.codepostal,
                                    ville: lieu.coordonnees.adresse.ville,
                                    region: lieu.coordonnees.adresse.region
                                }
                            };
                        }), ['adresse.code_postal']),
                        raison_sociale: formateur.raison_sociale_formateur,
                        codeRegion: findCodeRegion(data),
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

    return stats.invalid < 1000 ? Promise.resolve(stats) : Promise.reject(stats);
};
