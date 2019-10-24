const assert = require('assert');
const moment = require('moment');
const logger = require('../../../helpers/fake-logger');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const reconcile = require('../../../../src/jobs/reconciliation/tasks/reconcile');
const removePreviousImports = require('../../../../src/jobs/reconciliation/tasks/removePreviousImports');

describe(__filename, withMongoDB(({ getTestDatabase, importIntercarif }) => {

    it('should remove previous import', async () => {

        let db = await getTestDatabase();

        await importIntercarif();
        await reconcile(db, logger);

        await removePreviousImports(db, moment().toDate());

        let count = await db.collection('actionsReconciliees').countDocuments();
        assert.deepStrictEqual(count, 0);
    });

}));
