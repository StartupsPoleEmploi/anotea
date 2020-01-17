const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newStagiaire, newComment } = require('../../../../helpers/data/dataset');
const optOutStagiaire = require('../../../../../src/jobs/data/optOut/tasks/optOutStagiaire');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('should opt-out stagiaire', async () => {

        let db = await getTestDatabase();
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                token: '12345',
                personal: {
                    email: 'toto@email.fr',
                },
            })),
            insertIntoDatabase('comment', newComment({
                token: '12345',
            })),
        ]);

        await optOutStagiaire(db, 'toto@email.fr');

        assert.ok(await db.collection('stagiaires').count({ token: '12345' }) === 0);
        assert.ok(await db.collection('comment').count({ token: '12345' }) === 0);
        assert.ok(await db.collection('optOut').count() === 1);
        let doc = await db.collection('optOut').findOne();
        assert.ok(doc);
        assert.ok(doc.date);
        assert.deepStrictEqual(_.omit(doc, ['_id', 'date']), {
            md5: '7040db8f93ce225027f0a90221b7dbb7',
        });
    });
}));
