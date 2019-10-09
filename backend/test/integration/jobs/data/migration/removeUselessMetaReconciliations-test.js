const assert = require('assert');
const moment = require('moment');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const removeUselessMetaReconciliations = require('../../../../../src/jobs/data/migration/tasks/removeUselessMetaReconciliations');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('supprime les reconciliation inutiles', async () => {

        let db = await getTestDatabase();
        let now = new Date();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            meta: {
                reconciliations: [
                    {
                        date: moment(now).subtract(7, 'days').toDate(),
                        reconciliable: false
                    },
                    {
                        date: moment(now).subtract(8, 'days').toDate(),
                        reconciliable: true
                    },
                    {
                        date: moment(now).subtract(9, 'days').toDate(),
                        reconciliable: true
                    },
                    {
                        date: moment(now).subtract(10, 'days').toDate(),
                        reconciliable: true
                    },
                    {
                        date: moment(now).subtract(11, 'days').toDate(),
                        reconciliable: false
                    },
                ],
            },
        }));

        await removeUselessMetaReconciliations(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.meta.reconciliations, [
            {
                date: moment(now).subtract(7, 'days').toDate(),
                reconciliable: false
            },
            {
                date: moment(now).subtract(10, 'days').toDate(),
                reconciliable: true
            },
            {
                date: moment(now).subtract(11, 'days').toDate(),
                reconciliable: false
            },
        ]);
    });

}));
