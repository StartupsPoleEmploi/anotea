const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-db');
const logger = require('../../../../helpers/test-logger');
const doImport = require('../../../../../jobs/import/insee/importer');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should create new mapping', async () => {

        let db = await getTestDatabase();

        let importer = doImport(db, logger);
        await importer.doImport(path.join(__dirname, '../../../../../data', 'correspondances-code-insee-code-postal.csv'));
        let doc = await db.collection('inseeCode').findOne({ insee: '77130' });
        assert.deepEqual(_.omit(doc, ['_id']), {
            insee: '77130',
            postalCode: '77580',
        });
    });

}));
