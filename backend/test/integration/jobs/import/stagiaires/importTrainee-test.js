const md5 = require('md5');
const moment = require('moment');
const _ = require('lodash');
const assert = require('assert');
const md5File = require('md5-file/promise');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const importTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/importTrainee');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');
const ileDeFranceCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/ileDeFranceCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it('should import trainees from csv file', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();

        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), poleEmploiCSVHandler(db, regions));

        let count = await db.collection('trainee').countDocuments();
        assert.strictEqual(count, 4);
        let results = await db.collection('trainee').find({ 'trainee.name': 'MARTIN' }).toArray();
        assert.ok(results[0]._id);
        assert.ok(results[0].importDate);
        assert.ok(results[0].campaignDate);
        assert.ok(results[0].token);
        assert.deepStrictEqual(_.omit(results[0], ['_id', 'importDate', 'token', 'campaignDate']), {
            campaign: 'stagiaires-pe',
            avisCreated: false,
            trainee: {
                name: 'MARTIN',
                firstName: 'EUGENE',
                mailDomain: 'pe.com',
                email: 'email_1@pe.com',
                phoneNumbers: [
                    '0611111111',
                    ''
                ],
                emailValid: true,
                dnIndividuNational: '1111111111',
                idLocal: '0167942369Z'
            },
            training: {
                idFormation: '14_AF_0000044465',
                origineSession: 'C',
                title: 'Titre professionnel',
                startDate: new Date('2018-05-22T00:00:00.000Z'),
                scheduledEndDate: new Date('2018-08-24T00:00:00.000Z'),
                organisation: {
                    id: '14000000000000008098',
                    siret: '82436343601230',
                    label: 'ANOTEA FORMATION',
                    name: 'ANOTEA ACCES FORMATION'
                },
                place: {
                    departement: '91',
                    postalCode: '91130',
                    inseeCode: '91521',
                    city: 'Ris-Orangis'
                },
                certifInfo: {
                    id: '8122',
                    label: 'Titre professionnel'
                },
                idSession: '3565575',
                formacode: '31734',
                aesRecu: 'AES',
                referencement: '41N162945089',
                infoCarif: {
                    numeroSession: 'SE_0000160070',
                    numeroAction: '14_SE_0000160070'
                },
                codeFinanceur: [
                    '4',
                    '7'
                ],
                niveauEntree: 6,
                niveauSortie: 4,
                dureeHebdo: 35,
                dureeMaxi: 483,
                dureeEntreprise: 210,
                dureeIndicative: '94 jours',
                nombreHeuresCentre: 273
            },
            unsubscribe: false,
            mailSent: false,
            codeRegion: '11',
        });
    });

    it('should fail to import trainee when codeRegion can not be found', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-invalid-departement.csv');
        let { regions } = await getComponents();

        let stats = await importTrainee(db, logger, csvFile, poleEmploiCSVHandler(db, regions));
        assert.deepStrictEqual(stats, {
            invalid: 1,
            ignored: 0,
            imported: 0,
            total: 1,
        });
    });

    it('should ignore trainee with not active region (Occitanie)', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-inactive-region.csv');
        let { regions } = await getComponents();

        await importTrainee(db, logger, csvFile, poleEmploiCSVHandler(db, regions));

        let count = await db.collection('trainee').countDocuments();
        assert.strictEqual(count, 0);
    });

    it('should ignore trainee already imported', async () => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let results = await importTrainee(db, logger, getTestFile('stagiaires-pe-doublons.csv'), handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('should ignore trainee already removed', async () => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();
        await insertIntoDatabase('optOut', { type: 'stagiaire', md5: md5('email_1@pe.com') });
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 3,
            total: 4,
        });
    });

    it('should import trainees from CSV file (IDF)', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        await importTrainee(db, logger, getTestFile('stagiaires-idf.csv'), handler);

        let count = await db.collection('trainee').countDocuments();
        assert.strictEqual(count, 5);
        let docs = await db.collection('trainee').find({ 'trainee.email': 'email1@pe.fr' }).toArray();
        assert.ok(docs[0]._id);
        assert.ok(docs[0].importDate);
        assert.ok(docs[0].campaignDate);
        assert.ok(docs[0].token);
        assert.deepStrictEqual(_.omit(docs[0], ['_id', 'importDate', 'token', 'campaignDate']), {
            campaign: 'stagiaires-idf',
            sourceIDF: true,
            avisCreated: false,
            trainee: {
                name: 'MARTIN',
                firstName: 'Pierre',
                mailDomain: 'pe.fr',
                email: 'email1@pe.fr',
                phoneNumbers: ['06 12 34 56 78'],
                emailValid: true,
                dnIndividuNational: null,
                idLocal: null,
            },
            training: {
                idFormation: null,
                origineSession: null,
                title: 'ANOTEA FORMATION',
                startDate: new Date('2017-03-15T00:00:00.000Z'),
                scheduledEndDate: new Date('2018-08-31T00:00:00.000Z'),
                organisation: {
                    id: null,
                    siret: '77568497000673',
                    label: 'ASSOCIATION AURORE',
                    name: 'ASSOCIATION AURORE'
                },
                place: {
                    postalCode: '93190',
                    city: 'LIVRY GARGAN'
                },
                certifInfo: {
                    id: null,
                    label: null
                },
                idSession: null,
                formacode: null,
                referencement: null,
                infoCarif: {
                    numeroAction: null,
                    numeroSession: null
                },
                codeFinanceur: [
                    '2'
                ],
                niveauEntree: null,
                niveauSortie: null,
                dureeHebdo: null,
                dureeMaxi: null,
                dureeEntreprise: null,
                dureeIndicative: null,
                nombreHeuresCentre: null,
                infoRegion: {
                    idTrainee: '111111',
                    idActionFormation: 'S17AVJE93001NR',
                    idParcours: '17392'
                }
            },
            unsubscribe: false,
            mailSent: false,
            codeRegion: '11',
        });
    });

    it('should store import status', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        let hash = await md5File(getTestFile('stagiaires-pe.csv'));
        let status = await db.collection('importTrainee').findOne();
        assert.ok(status.date);
        assert.ok(status.campaignDate);
        assert.deepStrictEqual(_.omit(status, ['_id', 'date', 'campaignDate']), {
            campaign: 'stagiaires-pe',
            file: getTestFile('stagiaires-pe.csv'),
            hash,
            filters: {},
            stats: {
                ignored: 0,
                imported: 4,
                invalid: 0,
                total: 4,
            }
        });
    });

    it('should store import status with campaign date', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, getTestFile('stagiaires-pe_2018-11-20.csv'), handler);

        let hash = await md5File(getTestFile('stagiaires-pe_2018-11-20.csv'));
        let status = await db.collection('importTrainee').findOne();
        assert.ok(status.date);
        assert.deepStrictEqual(_.omit(status, ['_id', 'date']), {
            campaign: 'stagiaires-pe_2018-11-20',
            campaignDate: new Date('2018-11-20T00:00:00.000Z'),
            file: getTestFile('stagiaires-pe_2018-11-20.csv'),
            hash,
            filters: {},
            stats: {
                ignored: 0,
                imported: 1,
                invalid: 0,
                total: 1,
            }
        });
    });

    it('should return stats after a CSV has been imported', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 4,
            total: 4,
        });
    });

    it('cannot import same CSV twice', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importTrainee(db, logger, csvFile, handler);

        let results = await importTrainee(db, logger, csvFile, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 0,
            total: 0,
        });
    });

    it('should fail to import trainee with invalid email', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-invalid-email.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.strictEqual(count, 0);
    });

    it('can filter trainee by region', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importTrainee(db, logger, csvFile, handler, {
            codeRegion: '2'
        });

        let doc = await db.collection('trainee').findOne();
        assert.ok(doc.trainee);
        assert.deepStrictEqual(doc.trainee.email, 'email_4@pe.com');
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 3,
            imported: 1,
            total: 4,
        });
    });

    it('should filter trainee with conseil regional filter (excluded)', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-ara-conseil-regional.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, Object.assign({}, regions, {
            findActiveRegions: () => {
                return [{
                    codeRegion: '2',
                    conseil_regional: {
                        active: false,
                    },
                }];
            }
        }));

        let results = await importTrainee(db, logger, csvFile, handler);

        let doc = await db.collection('trainee').findOne();
        assert.deepStrictEqual(doc.trainee.email, 'email_4@pe.fr');
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 2,
            imported: 1,
            total: 3,
        });
    });

    it('should filter trainee with conseil regional filter (certifications_only)', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-ara-non-certifiantes.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, Object.assign({}, regions, {
            findActiveRegions: () => {
                return [{
                    codeRegion: '2',
                    conseil_regional: {
                        active: true,
                        import: 'certifications_only'
                    },
                }];
            }
        }));

        let results = await importTrainee(db, logger, csvFile, handler);

        let doc = await db.collection('trainee').findOne();
        assert.deepStrictEqual(doc.trainee.email, 'email_4@pe.fr');
        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 2,
            total: 3,
        });
    });

    it('should ignore trainee with scheduledEndDate before min date', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-old.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importTrainee(db, logger, csvFile, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('should ignore trainee with scheduledEndDate before min date (IDF)', async () => {

        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-idf-old.csv');
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        let results = await importTrainee(db, logger, csvFile, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('should convert NULL value into ""', async () => {
        let db = await getTestDatabase();
        let csvFile = getTestFile('stagiaires-pe-with-NULL.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, csvFile, handler);

        let doc = await db.collection('trainee').findOne();
        assert.deepStrictEqual(doc.training.codeFinanceur, []);
        assert.deepStrictEqual(doc.training.certifInfo, {
            id: '',
            label: '',
        });
    });

}));
