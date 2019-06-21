const assert = require('assert');
const moment = require('moment');
const logger = require('../../../helpers/test-logger');
const { withMongoDB } = require('../../../helpers/test-database');
const reconcile = require('../../../../src/jobs/reconciliation/tasks/reconcile');
const removePreviousImports = require('../../../../src/jobs/reconciliation/tasks/removePreviousImports');

describe(__filename, withMongoDB(({ getTestDatabase, importIntercarif }) => {

    it('should remove previous import', async () => {

        let db = await getTestDatabase();

        await importIntercarif();
        await reconcile(db, logger, { actions: true });

        await removePreviousImports(db, moment().toDate());

        let count = await db.collection('actionsReconciliees').countDocuments();
        assert.deepStrictEqual(count, 0);
    });

}));
