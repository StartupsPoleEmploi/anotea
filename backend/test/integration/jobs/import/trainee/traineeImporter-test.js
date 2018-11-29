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
                dept_num: '69',
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

    it('should store import status', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        let hash = await md5File(csvFile);
        let status = await db.collection('importTrainee').findOne();
        assert.ok(status.date);
        assert.ok(status.campaignDate);
        assert.deepEqual(_.omit(status, ['_id', 'date', 'campaignDate']), {
            campaign: 'stagiaires-pe',
            file: csvFile,
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
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe_2018-11-20.csv');
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        let hash = await md5File(csvFile);
        let status = await db.collection('importTrainee').findOne();
        assert.ok(status.date);
        assert.deepEqual(_.omit(status, ['_id', 'date']), {
            campaign: 'stagiaires-pe_2018-11-20',
            campaignDate: new Date('2018-11-20T00:00:00.000Z'),
            file: csvFile,
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
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger);
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
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        let results = await importer.importTrainee(csvFile, handler);
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 0,
            total: 0,
        });
    });

    it('should fail to import trainee with invalid email', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-email.csv');
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        await importer.importTrainee(csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 0);
    });

    it('can filter trainee by region', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler, {
            codeRegion: '2'
        });

        let doc = await db.collection('trainee').findOne();
        assert.ok(doc.trainee);
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
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler, {
            startDate: moment('2018-09-01 00Z').toDate(),
        });

        let doc = await db.collection('trainee').findOne();
        assert.ok(doc.trainee);
        assert.deepEqual(doc.trainee.email, 'email_4@pe.com');
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 3,
            imported: 1,
            total: 4,
        });
    });

    it('should filter trainee by code financeur (inclusion)', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-ara-filtered.csv');
        let importer = traineeImporter(db, logger);
        await insertDepartements();
        let handler = poleEmploiCSVHandler(db, logger, _.merge({}, configuration, {
            app: {
                active_regions: [
                    {
                        code_region: '2',
                        filters: {
                            code_financeurs: ['4']
                        }
                    }
                ]
            }
        }));

        let results = await importer.importTrainee(csvFile, handler);

        let doc = await db.collection('trainee').findOne({ 'trainee.email': 'email@pe.com' });
        assert.ok(doc.trainee);
        assert.deepEqual(doc.trainee.email, 'email@pe.com');
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 1,
            imported: 2,
            total: 3,
        });
    });

    it('should filter trainee by code financeur (exclusion)', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-ara-filtered.csv');
        let importer = traineeImporter(db, logger);
        let handler = poleEmploiCSVHandler(db, logger, Object.assign({}, configuration, {
            app: {
                active_regions: [
                    {
                        code_region: '2',
                        filters: {
                            code_financeurs: ['-4']
                        }
                    }
                ]
            }
        }));
        await insertDepartements();

        let results = await importer.importTrainee(csvFile, handler);

        let doc = await db.collection('trainee').findOne();
        assert.deepEqual(doc.trainee.email, 'email_4@pe.fr');
        assert.deepEqual(results, {
            invalid: 0,
            ignored: 2,
            imported: 1,
            total: 3,
        });
    });

}));
