const uuid = require('node-uuid');
const _ = require('lodash');
const { promiseAll } = require('../../job-utils');

module.exports = async (db, logger, regions) => {

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
            .filter(action => action.lieu_de_formation.coordonnees.adresse)
            .forEach(action => {
                let siret = action.organisme_formateur.siret_formateur.siret;
                let hasCourriel = !!_.get(action, 'organisme_formateur.contact_formateur');
                let previous = accumulator[siret];

                if (previous) {
                    accumulator[siret] = {
                        organisme_formateur: _.merge({}, previous.organisme_formateur, action.organisme_formateur),
                        courriels: _.unionWith(
                            previous.courriels,
                            hasCourriel ? [action.organisme_formateur.contact_formateur.coordonnees.courriel] : [],
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
                        courriels: hasCourriel ? [action.organisme_formateur.contact_formateur.coordonnees.courriel] : [],
                        lieux_de_formation: [action.lieu_de_formation],
                    };
                }
            });
        }
        return Object.values(accumulator);
    };

    const findRegion = data => {

        let results = data.lieux_de_formation.map(lieu => {
            try {
                return regions.findRegionByPostalCode(lieu.coordonnees.adresse.codepostal);
            } catch (e) {
                return null;
            }
        });

        if (_.every(results, r => r === null)) {
            throw new Error(`Unable to find region for organisme ${data.organisme_formateur.siret_formateur.siret}`);
        }

        return results.find(r => r);
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
                        codeRegion: findRegion(data).codeRegion,
                        courriel: data.courriels[0],
                        token: uuid.v4(),
                        creationDate: new Date(),
                        meta: {
                            siretAsString: siret,
                        }
                    },
                    $addToSet: {
                        courriels: { $each: data.courriels },
                        sources: 'intercarif',
                    },
                    $set: {
                        profile: 'organisme',
                        ...(formateur._attributes ? { numero: formateur._attributes.numero } : {}),
                        lieux_de_formation: data.lieux_de_formation.map(lieu => {
                            return {
                                nom: lieu.coordonnees.nom,
                                adresse: {
                                    code_postal: lieu.coordonnees.adresse.codepostal,
                                    ville: lieu.coordonnees.adresse.ville,
                                    region: lieu.coordonnees.adresse.region
                                }
                            };
                        }),
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
