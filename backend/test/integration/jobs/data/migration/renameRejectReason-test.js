const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const renameRejectReason = require('../../../../../src/jobs/data/migration/tasks/renameRejectReason');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('renomme rejectReason', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            rejected: true,
            rejectReason: 'injure',
        }));

        await renameRejectReason(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(!doc.rejectReason);
        assert.strictEqual(doc.qualification, 'injure');
    });

    it('supprime rejectReason vide', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            rejectReason: null,
        }));

        await renameRejectReason(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(!doc.rejectReason);
    });

}));
