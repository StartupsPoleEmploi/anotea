const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newOrganismeAccount, newComment } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/test-logger');
const IntercarifAccountImporter = require('../../../../../../jobs/import/organismes/intercarif/IntercarifAccountImporter');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    const prepareDatabase = () => {
        return Promise.all([
            insertIntoDatabase('departements', {
                region: 'Ile De France',
                dept_num: '75',
                region_num: '11',
                codeFinanceur: '2'
            }),
            insertIntoDatabase('intercarif_organismes_responsables', {
                numero: '14_OF_0000000261',
                siret: '11111111111111',
                nom: 'CSFIF',
                courriel: 'organisme@responsable.com',
                raison_sociale: 'Responsable',
                adresse: {
                    code_postal: '75019',
                    ville: 'Paris 19e',
                    region: '11'
                },
                organisme_formations: [
                    {
                        siret: '22222222222222',
                        raison_sociale: 'Responsable',
                        courriel: 'contact@formation.com',
                        lieux_de_formation: [
                            {
                                adresse: {
                                    code_postal: '75019',
                                    ville: 'Paris 19e',
                                    region: '11'
                                }
                            }
                        ]
                    }
                ],
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
            insertIntoDatabase('intercarif_organismes_formateurs', {
                siret: '22222222222222',
                numero: '14_OF_0000000123',
                courriel: 'organisme@formateur.com',
                raison_sociale: 'Formateur',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '75019',
                            ville: 'Paris 19e',
                            region: '11'
                        }
                    }
                ],
            }),
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

    it('should create new organisme formateur', async () => {

        let db = await getTestDatabase();
        await prepareDatabase();

        let importer = new IntercarifAccountImporter(db, logger);
        await importer.importAccounts();

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Formateur',
            courriel: 'organisme@formateur.com',
            courriels: ['organisme@formateur.com'],
            sources: ['intercarif'],
            codeRegion: '11',
            numero: '14_OF_0000000123',
            lieux_de_formation: [
                {
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris 19e',
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
        let importer = new IntercarifAccountImporter(db, logger);
        await prepareDatabase();
        await insertIntoDatabase('organismes', newOrganismeAccount({
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
        }));

        await importer.importAccounts();

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });
        assert.ok(doc.updateDate);
        assert.deepEqual(_.omit(doc, ['updateDate']), {
            //UNTOUCHED
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Formateur',
            passwordHash: 'hash',
            token: 'token',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            courriel: 'OLD@formateur.com',
            courriels: ['organisme@formateur.com'],
            sources: ['intercarif'],
            codeRegion: '11',
            numero: '14_OF_0000000123',
            lieux_de_formation: [
                {
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris 19e',
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
        await prepareDatabase();

        let importer = new IntercarifAccountImporter(db, logger);
        await importer.importAccounts();

        let doc = await db.collection('organismes').findOne({ SIRET: 11111111111111 });
        assert.ok(doc);
        assert.deepEqual(doc.score.nb_avis, 1);
    });


    it('should generate organismes collections', async () => {

        let db = await getTestDatabase();
        let importer = new IntercarifAccountImporter(db, logger);
        await importIntercarif();

        await importer.generateOrganismes();

        assert.deepEqual(await db.collection('intercarif_organismes_responsables').countDocuments(), 1);
        assert.deepEqual(await db.collection('intercarif_organismes_formateurs').countDocuments(), 1);
    });

}));
