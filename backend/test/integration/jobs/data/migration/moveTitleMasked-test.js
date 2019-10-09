const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
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
