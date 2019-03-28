const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newTrainee } = require('../../../../helpers/data/dataset');


describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {

    it('/track should update tracking informations in stagiaires', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee();
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app).get(`/mail/${trainee.token}/track`);

        assert.equal(response.statusCode, 200);

        let result = await db.collection('trainee').findOne({ token: trainee.token });

        assert.deepStrictEqual(trainee.token, result.token);
        assert.ok(result.tracking.firstRead);
        assert.ok(result.tracking.lastRead);
    });
}));
