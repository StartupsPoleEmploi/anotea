module.exports = (db, logger) => {

    const uuid = require('node-uuid');
    const { findCodeRegionByPostalCode } = require('../../../../components/regions')(db);

    const buildAccount = async (type, organisme) => {
        let codePostal = type === 'formateur' ? organisme.lieux_de_formation[0].adresse.code_postal :
            organisme.adresse.code_postal;

        let [codeRegion, nbAvis] = await Promise.all([
            findCodeRegionByPostalCode(codePostal),
            db.collection('comment').countDocuments({ 'training.organisation.siret': organisme.siret })
        ]);

        return {
            _id: parseInt(organisme.siret, 10),
            SIRET: parseInt(organisme.siret, 10),
            raisonSociale: organisme.raison_sociale,
            courriel: organisme.courriel,
            token: uuid.v4(),
            creationDate: new Date(),
            sources: ['intercarif'],
            codeRegion,
            meta: {
                siretAsString: organisme.siret,
                nbAvis
            }
        };
    };


    const createAccountsFromOrganismes = async (source, type, stats) => {
        let collection = db.collection('organismes');
        let cursor = db.collection(source).find({
            siret: { $ne: '00000000000000' },
            courriel: { $ne: null }
        });

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            try {
                let newAccount = await buildAccount(type, doc);
                let previous = await collection.findOne({ _id: newAccount._id });
                stats[source].total++;

                if (!previous) {
                    stats[source].created++;
                    await collection.insert(newAccount);
                    logger.debug(`New account ${newAccount.SIRET} created`);
                } else {
                    stats[source].updated++;
                    await collection.update({ _id: previous._id }, {
                        $addToSet: {
                            courrielsSecondaires: newAccount.courriel,
                            sources: 'intercarif'
                        },
                        $set: {
                            ...(previous.courriel ? {} : { courriel: newAccount.courriel }),
                            'updateDate': new Date(),
                            'codeRegion': newAccount.codeRegion,
                            'meta': newAccount.meta,
                        },
                    });
                    logger.debug(`Account ${newAccount.SIRET} updated`);
                }
            } catch (e) {
                stats[source].invalid++;
                logger.error(`Account cannot be imported from ${source}`, doc, e);
            }
        }
    };

    return {
        importAccounts: async () => {

            let stats = {
                organismes_responsables: {
                    total: 0,
                    updated: 0,
                    created: 0,
                    invalid: 0,
                },
                organismes_formateurs: {
                    total: 0,
                    updated: 0,
                    created: 0,
                    invalid: 0,
                },
            };

            await createAccountsFromOrganismes('organismes_responsables', 'responsable', stats);
            await createAccountsFromOrganismes('organismes_formateurs', 'formateur', stats);

            return stats;
        }
    };
};

