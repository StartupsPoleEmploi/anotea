const _ = require('lodash');
const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const doImportPostalCodes = require('../../../../../src/jobs/import/insee/importers/postalCodes');
const doImportCedex = require('../../../../../src/jobs/import/insee/importers/cedex');

describe(__filename, withMongoDB(({ getTestDatabase }) => {

    it('should create new mapping', async () => {

        let db = await getTestDatabase();
        const correspondancesFile = path.join(__dirname, '../../../../helpers/data', 'correspondance-code-insee-code-postal.csv');
        const cedexFile = path.join(__dirname, '../../../../helpers/data', 'liste-des-cedex.csv');

        let postalCodes = doImportPostalCodes(db, logger);
        let cedex = doImportCedex(db, logger);

        await postalCodes.doImport(correspondancesFile);
        await cedex.doImport(cedexFile);

        let doc = await db.collection('inseeCode').findOne({ insee: '77130' });
        assert.deepEqual(_.omit(doc, ['_id']), {
            insee: '77130',
            postalCode: '77580',
            commune: 'COULOMMES',
            cedex: []
        });

        doc = await db.collection('inseeCode').findOne({ insee: '84080' });
        assert.deepEqual(_.omit(doc, ['_id']), {
            insee: '84080',
            postalCode: '84170',
            commune: 'MONTEUX',
            cedex: ['84202', '84207']
        });
    }).timeout(30000);

}));
