const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newTrainee, newOrganismeAccount } = require('../../../../helpers/data/dataset');


describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {

    it('/track should update tracking informations in stagiaires', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee({
            tracking: {
                firstRead: new Date(),
            }
        });
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app).get(`/mail/${trainee.token}/track`);

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('trainee').findOne({ token: trainee.token });

        assert.deepStrictEqual(trainee.token, result.token);
        assert.ok(result.tracking.firstRead);
        assert.ok(result.tracking.lastRead);
    });

    it('/track should update tracking informations in organismes', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let account = newOrganismeAccount();
        await insertIntoDatabase('accounts', account);

        let response = await request(app).get(`/mail/${account.token}/track`);

        assert.strictEqual(response.statusCode, 200);

        let result = await db.collection('accounts').findOne({ token: account.token });

        assert.deepStrictEqual(account.token, result.token);
        assert.ok(result.tracking.firstRead);
    });
}));
