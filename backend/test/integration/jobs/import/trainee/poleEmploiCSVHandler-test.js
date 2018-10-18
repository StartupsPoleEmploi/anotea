const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../../helpers/test-db');
const logger = require('../../../../helpers/test-logger');
const traineeImporter = require('../../../../../jobs/import/trainee/traineeImporter');
const poleEmploiCSVHandler = require('../../../../../jobs/import/trainee/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const addIleDeFranceRegion = () => {
        return insertIntoDatabase('regions', {
            region: 'Ile De France',
            dept_num: '91',
            region_num: '11',
            codeFinanceur: '2'
        });
    };

    it('should import trainees from csv file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await addIleDeFranceRegion();

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 3);
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
        await addIleDeFranceRegion();

        await importer.importTrainee(csvFile, handler);

        let status = await db.collection('importTrainee').findOne();
        assert.deepEqual(_.omit(status, ['_id', 'date']), {
            campaign: 'stagiaires-pe',
            hash: '7378bf8cf388b87d34458b2d7907f4f4',
        });
    });

    it('should compute stats after a CSV has been imported', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await addIleDeFranceRegion();

        let results = await importer.importTrainee(csvFile, handler);

        assert.deepEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 3,
            total: 3,
        });
    });

    it('cannot import same CSV twice', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await addIleDeFranceRegion();

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
                invalid: 3,
                ignored: 0,
                imported: 0,
                total: 3,
            });
        }
    });

    it('should fail to import trainee with invalid email', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-email.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await addIleDeFranceRegion();

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 0);
    });

    it('should ignore trainee with region not yet handled', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-auvergne.csv');
        let importer = traineeImporter(db, logger, configuration);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertIntoDatabase('regions', {
            region: 'Auvergne-Rhône-Alpes',
            dept_num: '45',
            region_num: '2',
        });

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 0);
    });

}));
