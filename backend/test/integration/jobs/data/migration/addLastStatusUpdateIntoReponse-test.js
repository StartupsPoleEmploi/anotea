const moment = require('moment');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const addLastStatusUpdateIntoReponse = require('../../../../../src/jobs/data/migration/tasks/addLastStatusUpdateIntoReponse');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('ajoute la property "reponse.lastStatusUpdate" quand elle est manquante ', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await Promise.all([
            insertIntoDatabase('comment', newComment({
                token: '123',
                reponse: {
                    text: 'La réponse',
                    date: date,
                    status: 'none',
                },
            })),
        ]);

        let stats = await addLastStatusUpdateIntoReponse(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.reponse, {
            text: 'La réponse',
            date: date,
            lastStatusUpdate: date,
            status: 'none',
        });
        assert.deepStrictEqual(stats, {
            updated: 1,
        });
    });

    it('préserve la property "reponse.lastStatusUpdate" quand elle existe', async () => {

        let db = await getTestDatabase();
        let date = new Date();

        let lastStatusUpdate = new Date();
        await Promise.all([
            insertIntoDatabase('comment', newComment({
                token: '123',
                reponse: {
                    text: 'La réponse',
                    date: date,
                    lastStatusUpdate,
                    status: 'none',
                },
            })),
        ]);

        await addLastStatusUpdateIntoReponse(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.reponse, {
            text: 'La réponse',
            date: date,
            lastStatusUpdate: lastStatusUpdate,
            status: 'none',
        });
    });
}));
