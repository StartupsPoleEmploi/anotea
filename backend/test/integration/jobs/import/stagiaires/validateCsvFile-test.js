const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const logger = require('../../../../helpers/components/fake-logger');
const mailer = require('../../../../helpers/components/fake-mailer');
const validateCsvFile = require('../../../../../src/jobs/import/stagiaires/tasks/validateCsvFile');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');
const ileDeFranceCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/ileDeFranceCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile }) => {

    it('can validate PE file', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        let errors = await validateCsvFile(db, logger, getTestFile('stagiaires-pe.csv'), handler, mailer());

        assert.ok(!errors);
    });

    it('can validate IDF file', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = ileDeFranceCSVHandler(db, regions);

        let errors = await validateCsvFile(db, logger, getTestFile('stagiaires-idf.csv'), handler, mailer());

        assert.ok(!errors);
    });

    it('should detect invalid header', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let csvFile = getTestFile('stagiaires-pe-invalid-header.csv');
        let handler = poleEmploiCSVHandler(db, regions);

        let errors = await validateCsvFile(db, logger, csvFile, handler, mailer());

        assert.deepStrictEqual(errors.type, {
            name: 'BAD_HEADER',
            message: 'du format non conforme',
        });
        assert.ok(errors.line.startsWith('INVALID|'));
    });

    it('should detect invalid line', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let csvFile = getTestFile('stagiaires-pe-invalid-line.csv');
        let handler = poleEmploiCSVHandler(db, regions);

        let errors = await validateCsvFile(db, logger, csvFile, handler, mailer());

        assert.deepStrictEqual(errors.type, {
            name: 'BAD_DATA',
            message: 'du format non conforme',
        });
        assert.ok(errors.line.startsWith('MARTIN|EUGENE'));
    });

    it('should detect duplicated lines', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let csvFile = getTestFile('stagiaires-pe-invalid-duplicated.csv');
        let handler = poleEmploiCSVHandler(db, regions);

        let errors = await validateCsvFile(db, logger, csvFile, handler, mailer());

        assert.deepStrictEqual(errors.type, {
            name: 'DUPLICATED',
            message: 'de la présence de doublons',
        });
        assert.ok(errors.line.startsWith('DUPLICATED|EUGENE'));
    });

}));
