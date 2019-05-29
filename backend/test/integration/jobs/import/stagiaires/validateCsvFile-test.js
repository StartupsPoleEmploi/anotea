const path = require('path');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const validateCsvFile = require('../../../../../src/jobs/import/stagiaires/validateCsvFile');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/handlers/poleEmploiCSVHandler');
const ileDeFranceCSVHandler = require('../../../../../src/jobs/import/stagiaires/handlers/ileDeFranceCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents }) => {

    it('can validate PE file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepStrictEqual(validationErrors, null);
    });

    it('can validate IDF file', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-idf.csv');
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepStrictEqual(validationErrors, null);
    });

    it('should detect invalid header', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-header.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepStrictEqual(validationErrors.type, {
            name: 'BAD_HEADER',
            message: 'du format non conforme',
        });
        assert.ok(validationErrors.line.startsWith('INVALID|'));
    });

    it('should detect invalid line', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-line.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepStrictEqual(validationErrors.type, {
            name: 'BAD_DATA',
            message: 'du format non conforme',
        });
        assert.ok(validationErrors.line.startsWith('MARTIN|EUGENE'));
    });

    it('should detect duplicated lines', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'stagiaires-pe-invalid-duplicated.csv');
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let validationErrors = await validateCsvFile(csvFile, handler);

        assert.deepStrictEqual(validationErrors.type, {
            name: 'DUPLICATED',
            message: 'de la présence de doublons',
        });
        assert.ok(validationErrors.line.startsWith('DUPLICATED|EUGENE'));
    });

}));
