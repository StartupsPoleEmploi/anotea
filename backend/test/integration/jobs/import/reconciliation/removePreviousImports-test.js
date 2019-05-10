const assert = require('assert');
const moment = require('moment');
const { withMongoDB } = require('../../../../helpers/test-database');
const generateActions = require('../../../../../src/jobs/import/reconciliation/generateActions');
const removePreviousImports = require('../../../../../src/jobs/import/reconciliation/removePreviousImports');

describe(__filename, withMongoDB(({ getTestDatabase, importIntercarif }) => {

    it('should remove previous import', async () => {

        let db = await getTestDatabase();

        await importIntercarif();
        await generateActions(db);

        await removePreviousImports(db, moment().toDate());

        let count = await db.collection('actionsReconciliees').countDocuments();
        assert.deepStrictEqual(count, 0);
    });

}));
