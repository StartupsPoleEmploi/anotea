const path = require('path');
const moment = require('moment');
const _ = require('lodash');
const assert = require('assert');
const md5File = require('md5-file/promise');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const importTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/importTrainee');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents }) => {

    it('should store import status', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, csvFile, handler);

        let hash = await md5File(csvFile);
        let status = await db.collection('importTrainee').findOne();
        assert.ok(status.date);
        assert.ok(status.campaignDate);
        assert.deepStrictEqual(_.omit(status, ['_id', 'date', 'campaignDate']), {
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
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, csvFile, handler);

        let hash = await md5File(csvFile);
        let status = await db.collection('importTrainee').findOne();
        assert.ok(status.date);
        assert.deepStrictEqual(_.omit(status, ['_id', 'date']), {
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
        let { regions } = await getComponents();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importTrainee(db, logger, csvFile, handler);

        assert.deepStrictEqual(results, {
            invalid: 0,
            ignored: 0,
            imported: 4,
            total: 4,
        });
    });

    it('cannot import same CSV twice', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
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

    it('can append stagiaires to an existing campaign', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);
        await importTrainee(db, logger, csvFile, handler);

        let results = await importTrainee(db, logger, csvFile, handler, { append: true });

        assert.deepStrictEqual(results, {
            ignored: 4,
            imported: 0,
            invalid: 0,
            total: 4,
        });
        assert.deepStrictEqual(await db.collection('importTrainee').countDocuments(), 1);
        let status = await db.collection('importTrainee').findOne();
        assert.deepStrictEqual(status.stats, {
            ignored: 0,
            imported: 4,
            invalid: 0,
            total: 4,
        });
    });

    it('should fail to import trainee with invalid email', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-email.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, csvFile, handler);

        let count = await db.collection('trainee').countDocuments();
        assert.equal(count, 0);
    });

    it('can filter trainee by region', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
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

    it('can filter trainee by session date', async () => {
        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let results = await importTrainee(db, logger, csvFile, handler, {
            since: moment('2018-09-01 00Z').toDate(),
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
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-ara-conseil-regional.csv');
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
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-ara-non-certifiantes.csv');
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

}));
