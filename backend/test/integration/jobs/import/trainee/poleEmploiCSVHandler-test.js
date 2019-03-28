const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const traineeImporter = require('../../../../../src/jobs/import/trainee/traineeImporter');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/trainee/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, insertRegions, getComponents }) => {

    it('should import trainees from csv file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let { regions } = await getComponents();
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, regions);
        await insertRegions();

        await importer.importTrainee(csvFile, handler);

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
            codeRegion: '11',
        });
    });

    it('should fail to import trainee when codeRegion can not be found', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-departement.csv');
        let { regions } = await getComponents();
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, regions);

        try {
            await importer.importTrainee(csvFile, handler);
            assert.fail('Should have fail');
        } catch (e) {
            assert.deepStrictEqual(e, {
                invalid: 1,
                ignored: 0,
                imported: 0,
                total: 1,
            });
        }
    });

    it('should ignore trainee with not active region (Occitanie)', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-inactive-region.csv');
        let { regions } = await getComponents();
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, regions);
        await insertRegions();

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.strictEqual(count, 0);
    });

    it('should ignore trainee already imported', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let { regions } = await getComponents();
        let csvFileWithDuplicates = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-doublons.csv');
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, regions);
        await insertRegions();

        await importer.importTrainee(csvFile, handler);
        let results = await importer.importTrainee(csvFileWithDuplicates, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 0,
            total: 1,
        });
    });

}));
