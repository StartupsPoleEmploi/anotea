const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../helpers/with-server');
const { newStagiaire, newOrganismeAccount } = require('../../../helpers/data/dataset');


describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {
    it('can unsubscribe', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let stagiaire = newStagiaire({
            tracking: {
                firstRead: new Date(),
            },
            unsubscribe: false,
        });
        await insertIntoDatabase('stagiaires', stagiaire);

        let response = await request(app).get(`/emails/stagiaires/${stagiaire.token}/unsubscribe`);

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('stagiaires').findOne({ token: stagiaire.token });

        assert.ok(result.unsubscribe);
    });
}));
