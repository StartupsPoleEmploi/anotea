const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const convertModerationStatus = require('../../../../../src/jobs/data/migration/tasks/convertModerationStatus');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('met status=published aux notes', async () => {

        let db = await getTestDatabase();
        let notes = newComment({
            token: '123',
            rejected: true,
            rejectReason: 'injure',
        });
        delete notes.comment;
        delete notes.published;
        await insertIntoDatabase('comment', notes);

        await convertModerationStatus(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(!doc.published);
        assert.ok(!doc.rejected);
        assert.ok(!doc.moderated);
        assert.ok(!doc.reported);
        assert.strictEqual(doc.status, 'published');
    });

    it('convertit published', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            moderated: true,
            published: true,
            rejected: false,
            reported: false,
        }));

        await convertModerationStatus(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(!doc.published);
        assert.ok(!doc.rejected);
        assert.ok(!doc.moderated);
        assert.ok(!doc.reported);
        assert.strictEqual(doc.status, 'published');
    });

    it('convertit rejected', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            moderated: true,
            published: false,
            rejected: true,
            reported: false,
        }));

        await convertModerationStatus(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(!doc.published);
        assert.ok(!doc.rejected);
        assert.ok(!doc.moderated);
        assert.ok(!doc.reported);
        assert.strictEqual(doc.status, 'rejected');
    });

    it('convertit reported', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            moderated: true,
            published: false,
            rejected: false,
            reported: true,
        }));

        await convertModerationStatus(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(!doc.published);
        assert.ok(!doc.rejected);
        assert.ok(!doc.moderated);
        assert.ok(!doc.reported);
        assert.strictEqual(doc.status, 'reported');
    });

}));
