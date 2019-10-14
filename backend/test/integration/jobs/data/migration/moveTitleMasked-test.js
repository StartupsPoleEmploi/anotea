const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const moveTitleMasked = require('../../../../../src/jobs/data/migration/tasks/moveTitleMasked');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('ajoute la property "titleMasked" quand elle est manquante ', async () => {

        let db = await getTestDatabase();
        let comment = newComment({ token: '123' });
        delete comment.titleMasked;
        await insertIntoDatabase('comment', comment);

        let stats = await moveTitleMasked(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.comment.titleMasked, false);
        assert.deepStrictEqual(stats, {
            updated: 1,
        });
    });

    it('ignore la property "titleMasked" pour les notes ', async () => {

        let db = await getTestDatabase();
        let comment = newComment({ token: '123' });
        delete comment.titleMasked;
        delete comment.comment;
        await insertIntoDatabase('comment', comment);

        await moveTitleMasked(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(!doc.comment);
    });

    it('déplace la property "titleMasked" quand elle existe ', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            titleMasked: true,
        }));

        await moveTitleMasked(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.comment.titleMasked, true);
    });
}));
