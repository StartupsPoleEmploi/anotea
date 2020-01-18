const uuid = require('node-uuid');
const _ = require('lodash');
const { promiseAll } = require('../../job-utils');

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
                return action.lieu_de_formation.coordonnees.adresse && action.organisme_formateur.siret_formateur.siret !== '0';
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

        let lieu = data.lieux_de_formation.find(lieu => lieu.coordonnees.adresse.code_region !== 'XX');

        if (!lieu) {
            throw new Error(`Unable to find region for organisme ${data.organisme_formateur.siret_formateur.siret}`);
        }

        return lieu.coordonnees.adresse.code_region;
    };

    const synchronizeAccount = async data => {

        try {
            stats.total++;

            let formateur = data.organisme_formateur;
            let siret = formateur.siret_formateur.siret;
            let id = parseInt(siret, 10);

            let results = await db.collection('accounts').updateOne(
                { _id: id },
                {
                    $setOnInsert: {
                        _id: id,
                        SIRET: id,
                        raisonSociale: formateur.raison_sociale_formateur,
                        codeRegion: findCodeRegion(data),
                        courriel: data.courriels.length > 0 ? data.courriels[0].courriel : null,
                        token: uuid.v4(),
                        creationDate: new Date(),
                        meta: {
                            siretAsString: siret,
                        }
                    },
                    $addToSet: {
                        sources: 'intercarif',
                        courriels: { $each: data.courriels },
                    },
                    $set: {
                        profile: 'organisme',
                        //TODO remove underscores
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
