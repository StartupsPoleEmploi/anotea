const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const doImport = require('../../../../../src/jobs/import/rome/importer');

describe(__filename, withMongoDB(({ getTestDatabase }) => {

    it('should create new mapping', async () => {

        let db = await getTestDatabase();

        let importer = doImport(db, logger);
        await importer.doImport(path.join(__dirname, '../../../../helpers/data', 'romeMapping.csv'));
        let doc = await db.collection('formacodeRomeMapping').findOne({ codeROME: 'A1101' });
        assert.deepEqual(_.omit(doc, ['_id']), {
            codeROME: 'A1101',
            label: 'Conduite d\'engins agricoles et forestiers',
            formacodes:
                [
                    { formacode: '21032', label: 'AGROEQUIPEMENT' },
                    { formacode: '21043', label: 'BUCHERONNAGE' },
                    { formacode: '21042', label: 'EXPLOITATION FORESTIERE' },
                    { formacode: '21011', label: 'MACHINISME AGRICOLE' },
                    { formacode: '21044', label: 'MACHINISME FORESTIER' },
                    { formacode: '21034', label: 'MACHINISME HORTICOLE' },
                    { formacode: '21055', label: 'M\nACHINISME VITICOLE' }
                ]
        });
    });

}));
