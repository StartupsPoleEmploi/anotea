const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const convertArchivedIntoStatus = require('../../../../../src/jobs/data/migration/tasks/convertArchivedIntoStatus');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('convertit archived=true', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            archived: true,
            status: 'published',
        }));

        await convertArchivedIntoStatus(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.strictEqual(doc.status, 'archived');
        assert.strictEqual(doc.archived, undefined);
    });

    it('supprime archived=false', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            archived: false,
            status: 'published',
        }));

        await convertArchivedIntoStatus(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.strictEqual(doc.status, 'published');
        assert.strictEqual(doc.archived, undefined);
    });

}));
