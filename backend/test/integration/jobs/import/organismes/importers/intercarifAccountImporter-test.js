const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newOrganismeAccount, newComment } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/test-logger');
const IntercarifAccountImporter = require('../../../../../../jobs/import/organismes/accounts/IntercarifAccountImporter');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const prepareDatabase = () => {
        return Promise.all([
            insertIntoDatabase('departements', {
                region: 'Ile De France',
                dept_num: '75',
                region_num: '11',
                codeFinanceur: '2'
            }),
            insertIntoDatabase('organismes_responsables', {
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
                ]
            }),
            insertIntoDatabase('organismes_formateurs', {
                siret: '22222222222222',
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
                organisme_responsable: {
                    numero: '14_OF_0000000261',
                    siret: '11111111111111',
                    raison_sociale: 'Formateur',
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris 19e',
                        region: '11'
                    },
                    courriel: 'contact@responsable.com'
                }
            })
        ]);
    };

    it('should create new organisme responsable', async () => {

        let db = await getTestDatabase();
        await prepareDatabase();

        let importer = new IntercarifAccountImporter(db, logger);
        await importer.importAccounts();

        let doc = await db.collection('organismes').findOne({ SIRET: 11111111111111 });
        assert.ok(doc.creationDate);
        assert.ok(doc.token);
        assert.deepEqual(_.omit(doc, ['creationDate', 'updateDate', 'token']), {
            _id: 11111111111111,
            SIRET: 11111111111111,
            raisonSociale: 'Responsable',
            courriel: 'organisme@responsable.com',
            sources: ['intercarif'],
            codeRegion: '11',
            meta: {
                siretAsString: '11111111111111',
                nbAvis: 0,
            }
        });
    });

    it('should update only specific properties of an exiting organisme responsable', async () => {

        let db = await getTestDatabase();
        await prepareDatabase();
        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            raisonSociale: 'Responsable',
            courriel: 'OLD@responsable.com',
            codeRegion: '99', //INVALID
            passwordHash: 'hash',
            token: 'token',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            meta: {
                siretAsString: '11111111111111',
                nbAvis: 0,
            },
        }));

        let importer = new IntercarifAccountImporter(db, logger);
        await importer.importAccounts();

        let doc = await db.collection('organismes').findOne({ SIRET: 11111111111111 });
        assert.ok(doc.updateDate);
        assert.deepEqual(_.omit(doc, ['updateDate']), {
            //UNTOUCHED
            _id: 11111111111111,
            SIRET: 11111111111111,
            raisonSociale: 'Responsable',
            passwordHash: 'hash',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
            token: 'token',
            meta: {
                siretAsString: '11111111111111',
                nbAvis: 0,
            },

            //UPDATED
            courriel: 'OLD@responsable.com',
            courrielsSecondaires: ['organisme@responsable.com'],
            sources: ['intercarif'],
            codeRegion: '11',
        });
    });

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
            sources: ['intercarif'],
            codeRegion: '11',
            meta: {
                siretAsString: '22222222222222',
                nbAvis: 0,
            }
        });
    });

    it('should update an existing organisme formateur', async () => {

        let db = await getTestDatabase();
        let importer = new IntercarifAccountImporter(db, logger);
        await prepareDatabase();
        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Formateur',
            courriel: 'OLD@formateur.com',
            meta: {
                siretAsString: '22222222222222',
            },
            codeRegion: '99', //INVALID
            passwordHash: 'hash',
            token: 'token',
            creationDate: new Date('2016-11-10T17:41:03.308Z'),
            mailSentDate: new Date('2018-09-12T15:21:28.083Z'),
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
            //UPDATED
            courriel: 'OLD@formateur.com',
            courrielsSecondaires: ['organisme@formateur.com'],
            sources: ['intercarif'],
            codeRegion: '11',
            meta: {
                siretAsString: '22222222222222',
                nbAvis: 0,
            },
        });
    });

    it('when courriel is missing should add it', async () => {

        let db = await getTestDatabase();
        let importer = new IntercarifAccountImporter(db, logger);
        await prepareDatabase();
        await insertIntoDatabase('organismes', {
            _id: 22222222222222,
            SIRET: 22222222222222,
            raisonSociale: 'Formateur',
            token: '2c31a610-d68b-4156-8647-e78091066619',
            creationDate: new Date('2018-09-12T15:25:18.536Z'),
        });

        await importer.importAccounts();

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });
        assert.deepEqual(doc.courriel, 'organisme@formateur.com');
    });

    it('should compute nbAvis', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            prepareDatabase(),
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `22222222222222`,
                    },
                }
            }))
        ]);

        let importer = new IntercarifAccountImporter(db, logger);
        await importer.importAccounts();

        let doc = await db.collection('organismes').findOne({ SIRET: 22222222222222 });
        assert.deepEqual(doc.meta.nbAvis, 1);
    });

}));
