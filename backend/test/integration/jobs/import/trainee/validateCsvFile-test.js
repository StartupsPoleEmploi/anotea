const path = require('path');
const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../../helpers/test-db');
const logger = require('../../../../helpers/test-logger');
const validateCsvFile = require('../../../../../lib/jobs/import/trainee/validateCsvFile');
const poleEmploiCSVHandler = require('../../../../../lib/jobs/import/trainee/handlers/poleEmploiCSVHandler');
const ileDeFranceCSVHandler = require('../../../../../lib/jobs/import/trainee/handlers/ileDeFranceCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const insertDepartement = () => {
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

    it('can validate PE file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartement();

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepEqual(validationErrors, null);
    });

    it('can validate IDF file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-idf.csv');
        let handler = ileDeFranceCSVHandler(db, logger, configuration);

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepEqual(validationErrors, null);
    });

    it('should detect invalid header', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-header.csv');
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartement();

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepEqual(validationErrors.type, {
            name: 'BAD_HEADER',
            message: 'du format non conforme',
        });
        assert.ok(validationErrors.line.startsWith('INVALID|'));
    });

    it('should detect invalid line', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-line.csv');
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartement();

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepEqual(validationErrors.type, {
            name: 'BAD_DATA',
            message: 'du format non conforme',
        });
        assert.ok(validationErrors.line.startsWith('MARTIN|EUGENE'));
    });

    it('should detect duplicated lines', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-duplicated.csv');
        let handler = poleEmploiCSVHandler(db, logger, configuration);
        await insertDepartement();

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepEqual(validationErrors.type, {
            name: 'DUPLICATED',
            message: 'de la présence de doublons',
        });
        assert.ok(validationErrors.line.startsWith('DUPLICATED|EUGENE'));
    });

}));
