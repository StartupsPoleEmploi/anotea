const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newOrganismeAccount, newComment } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const importAccounts = require('../../../../../jobs/import/organismes/importAccounts');
const generateOrganismes = require('../../../../../jobs/import/organismes/generateOrganismes');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');

    const prepareDatabase = () => {
        return Promise.all([
            insertIntoDatabase('departements', {
                region: 'Ile De France',
                dept_num: '75',
                region_num: '11',
                codeFinanceur: '2'
            }),
            insertIntoDatabase('departements', {
                region: 'Aquitaine',
                dept_num: '33',
                region_num: '1'
            }),
            insertIntoDatabase('departements', {
                region: 'Grand Est',
                dept_num: '57',
                region_num: '7'
            }),
            insertIntoDatabase('departements', {
                region: 'Hauts-de-France',
                dept_num: '59',
                region_num: '10'
            }),
            insertIntoDatabase('departements', {
                region: 'Seine-Saint-Denis',
                dept_num: '93',
                region_num: '11'
            }),
            ...(
                _.range(1).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        training: {
                            organisation: {
                                siret: '11111111111111',
                            },
                        }
                    }));
                })
            ),
            ...(
                _.range(2).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        training: {
                            organisation: {
                                siret: '22222222222222',
                            },
                        }
                    }));
                })
            ),
        ]);
    };

    it('should create new organisme formateur and merge Kairos data', async () => {

        let db = await getTestDatabase();
        await Promise.all([importIntercarif(), prepareDatabase()]);

        await generateOrganismes(db, logger, csvFile);
        await importAccounts(db, logger);

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            courriel: 'anotea.pe+paris@gmail.com',
            courriels: ['anotea.pe+paris@gmail.com'],
            sources: ['intercarif'],
            codeRegion: '1',
            kairosCourriel: 'contact+kairos@formation.fr',
            numero: 'OF_XXX',
            raisonSociale: 'Anotea Formation Paris',
            lieux_de_formation: [
                {
                    nom: 'Anotea Formation Paris',
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris',
                        region: '11'
                    }
                }
            ],
            score: {
                nb_avis: 2,
                notes: {
                    accompagnement: 1,
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    global: 2,
                }
            },
            meta: {
                siretAsString: '22222222222222',
            },
        });
    });

    it('should update organismes', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            importIntercarif(),
            prepareDatabase(),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                raisonSociale: 'Formateur',
                courriel: 'OLD@formateur.com',
                passwordHash: 'hash',
                token: 'token',
                creationDate: new Date('2016-11-10T17:41:03.308Z'),
                mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
                score: {
                    nb_avis: 1,
                },
                meta: {
                    siretAsString: '22222222222222',
                },
            })),
        ]);

        await generateOrganismes(db, logger, csvFile);
        await importAccounts(db, logger);

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.updateDate);
        assert.deepEqual(_.omit(doc, ['updateDate']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Formateur',
            passwordHash: 'hash',
            token: 'token',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            courriel: 'OLD@formateur.com',
            courriels: ['anotea.pe+paris@gmail.com'],
            sources: ['intercarif'],
            codeRegion: '11',
            numero: 'OF_XXX',
            lieux_de_formation: [
                {
                    nom: 'Anotea Formation Paris',
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris',
                        region: '11'
                    }
                }
            ],
            score: {
                nb_avis: 2,
                notes: {
                    accompagnement: 1,
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    global: 2,
                }
            },
            meta: {
                siretAsString: '22222222222222',
            },
        });
    });

    it('should create new organisme responsable', async () => {

        let db = await getTestDatabase();
        await Promise.all([importIntercarif(), prepareDatabase()]);

        await generateOrganismes(db, logger, csvFile);
        await importAccounts(db, logger);

        let doc = await db.collection('organismes').findOne({ SIRET: 11111111111111 });
        assert.ok(doc);
        assert.deepEqual(doc.score.nb_avis, 1);
    });

    it('should create new organisme from kairos', async () => {

        let db = await getTestDatabase();
        await Promise.all([importIntercarif(), prepareDatabase()]);

        await generateOrganismes(db, logger, csvFile);
        await importAccounts(db, logger);

        let doc = await db.collection('organismes').findOne({ SIRET: 33333333333333 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 33333333333333,
            SIRET: 33333333333333,
            courriel: 'contact+kairos@formation.fr',
            courriels: ['contact+kairos@formation.fr'],
            sources: ['kairos'],
            codeRegion: '10',
            kairosCourriel: 'contact+kairos@formation.fr',
            numero: null,
            raisonSociale: 'Pole Emploi Formation Nord',
            lieux_de_formation: [],
            score: {
                nb_avis: 0,
            },
            meta: {
                siretAsString: '33333333333333',
            },
        });
    });

}));
