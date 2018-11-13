const path = require('path');
const moment = require('moment');
const _ = require('lodash');
const assert = require('assert');
const md5File = require('md5-file/promise');
const configuration = require('config');
const { withMongoDB } = require('../../../../helpers/test-db');
const logger = require('../../../../helpers/test-logger');
const traineeImporter = require('../../../../../jobs/import/trainee/traineeImporter');
const poleEmploiCSVHandler = require('../../../../../jobs/import/trainee/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const insertDepartements = () => {
        return Promise.all([
            insertIntoDatabase('departements', {
                region: 'Auvergne-Rhône-Alpes',
                dept_num: '45',
                region_num: '2',
            }),
            insertIntoDatabase('departements', {
                region: 'Ile De France',
                dept_num: '91',
                region_num: '11',
                codeFinanceur: '2'
            })
        ]);
    };

    it('should import trainees from csv file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 4);
        let results = await db.collection('trainee').find({ 'trainee.name': 'MARTIN' }).toArray();
        assert.ok(results[0]._id);
        assert.ok(results[0].importDate);
        assert.ok(results[0].token);
        assert.deepEqual(_.omit(results[0], ['_id', 'importDate', 'token']), {
            campaign: 'stagiaires-pe',
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
                startDate: new Date('2018-05-21T22:00:00.000Z'),
                scheduledEndDate: new Date('2018-08-23T22:00:00.000Z'),
                organisation: {
                    id: '14000000000000008098',
                    siret: '82436343601230',
                    label: 'ANOTEA FORMATION',
                    name: 'ANOTEA ACCES FORMATION'
                },
                place: {
                    departement: '91',
                    postalCode: '91130',
                    city: 'Ris-Orangis'
                },
                certifInfo: {
                    id: '84244',
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
                    '2',
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
            codeRegion: '11'
        });
    });

    it('should store import status', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        let hash = await md5File(csvFile);
        let status = await db.collection('importTrainee').findOne();
        assert.deepEqual(_.omit(status, ['_id', 'date']), {
            campaign: 'stagiaires-pe',
            hash,
        });
    });

    it('should compute stats after a CSV has been imported', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler);

        assert.deepEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 4,
            total: 4,
        });
    });

    it('cannot import same CSV twice', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        try {
            await importer.importTrainee(csvFile, handler);
            assert.fail('Should have fail');
        } catch (e) {
            assert.ok(e.message.indexOf('already imported') !== -1);
        }
    });

    it('should fail to import trainee when codeRegion can not be found', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);

        try {
            await importer.importTrainee(csvFile, handler);
            assert.fail('Should have fail');
        } catch (e) {
            assert.deepEqual(e, {
                invalid: 4,
                ignored: 0,
                imported: 0,
                total: 4,
            });
        }
    });

    it('should fail to import trainee with invalid email', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-email.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 0);
    });

    it('should ignore trainee with not active region', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-inactive-region.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertIntoDatabase('departements', {
            region: 'Occitanie',
            dept_num: '66',
            region_num: '16'
        });

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 0);
    });

    it('should ignore trainee already imported', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let csvFileWithDuplicates = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-doublons.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);
        let results = await importer.importTrainee(csvFileWithDuplicates, handler);

        assert.deepEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

    it('can filter trainee by region', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler, {
            codeRegion: '2'
        });

        let doc = await db.collection('trainee').findOne();
        assert.deepEqual(doc.trainee.email, 'email_4@pe.com');
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 3,
            imported: 1,
            total: 4,
        });
    });

    it('can filter trainee by session date', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler, {
            startDate: moment('01/09/2018', 'DD/MM/YYYY'),
        });

        let doc = await db.collection('trainee').findOne();
        assert.deepEqual(doc.trainee.email, 'email_4@pe.com');
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 3,
            imported: 1,
            total: 4,
        });
    });

    it('can filter trainee with code financer', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler, {
            includeCodeFinancer: '13',
        });

        let doc = await db.collection('trainee').findOne();
        assert.deepEqual(doc.trainee.email, 'email_4@pe.com');
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 3,
            imported: 1,
            total: 4,
        });
    });

    it('can filter trainee by excluding code financer', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler, {
            excludeCodeFinancer: '13',
        });

        let doc = await db.collection('trainee').findOne();
        assert.deepEqual(doc.trainee.email, 'email_1@pe.com');
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 3,
            total: 4,
        });
    });

}));
