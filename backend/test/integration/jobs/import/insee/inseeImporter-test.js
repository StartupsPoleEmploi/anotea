const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const doImport = require('../../../../../src/jobs/import/insee/importer');

describe(__filename, withMongoDB(({ getTestDatabase }) => {

    it('should create new mapping', async () => {

        let db = await getTestDatabase();
        let correspondancesFile = path.join(__dirname, '../../../../helpers/data', 'correspondance-code-insee-code-postal.csv');

        let importer = doImport(db, logger);

        await importer.doImport(correspondancesFile);

        let doc = await db.collection('inseeCode').findOne({ insee: '77130' });
        assert.deepEqual(_.omit(doc, ['_id']), {
            insee: '77130',
            postalCode: '77580',
            commune: 'COULOMMES'
        });

        doc = await db.collection('inseeCode').findOne({ insee: '63402' });
        assert.deepEqual(_.omit(doc, ['_id']), {
            insee: '63402',
            postalCode: '63550',
            commune: 'SAINT-VICTOR-MONTVIANEIX'
        });
    });

}));
