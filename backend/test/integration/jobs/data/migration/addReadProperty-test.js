const moment = require('moment');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const addReadProperty = require('../../../../../src/jobs/data/migration/tasks/addReadProperty');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('ajoute la property "read" quand elle est manquante', async () => {

        let db = await getTestDatabase();
        let comment = newComment({ token: '123' });
        delete comment.read;
        await insertIntoDatabase('comment', comment);

        await addReadProperty(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.read, false);
    });

    it('ajoute la property "read=true" quand elle est manquante pour les anciennes notes', async () => {

        let db = await getTestDatabase();
        let comment = newComment({
            token: '123',
            date: moment('2019-06-01 00Z').toDate(),
        });
        delete comment.read;
        delete comment.comment;
        await insertIntoDatabase('comment', comment);

        await addReadProperty(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.read, true);
    });

    it('ajoute la property "read=false" quand elle est manquante  pour les anciennes notes', async () => {

        let db = await getTestDatabase();
        let comment = newComment({
            token: '123',
            date: moment('2019-10-01 00Z').toDate(),
        });
        delete comment.read;
        delete comment.comment;
        await insertIntoDatabase('comment', comment);

        await addReadProperty(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.read, false);
    });
}));
