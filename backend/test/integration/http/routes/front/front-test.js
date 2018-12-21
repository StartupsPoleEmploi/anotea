const request = require('supertest');
const assert = require('assert');
const moment = require('moment');
const { withServer } = require('../../../../helpers/test-server');
const { newTrainee } = require('../../../../helpers/data/dataset');

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe(__filename, withServer(({ startServer, getTestDatabase, insertIntoDatabase }) => {

    it('/questionnaire can get questionnaire and create comment on first request', async () => {

        let app = await startServer();
        let trainee = newTrainee();
        await insertIntoDatabase('trainee', trainee);

        let response = await request(app).get(`/questionnaire/${trainee.token}`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        assert.ok(response.text.startsWith('<!DOCTYPE HTML>'));
        assert.ok(response.text.includes('Contenu de la formation') !== -1);
    });

    it('/questionnaire should create comment on first access', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee();
        await insertIntoDatabase('trainee', trainee);

        await request(app).get(`/questionnaire/${trainee.token}`);

        await sleep(100);// Wait for data to be saved into MongoDB
        let comment = await db.collection('comment').findOne({ token: trainee.token, step: 1, codeRegion: '11' });
        assert.ok(comment);
    });

    it('/questionnaire should save device data', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee();
        await insertIntoDatabase('trainee', trainee);

        await request(app).get(`/questionnaire/${trainee.token}`);

        await sleep(100);// Wait for data to be saved into MongoDB
        let result = await db.collection('trainee').findOne({ token: trainee.token });
        assert.deepEqual(result.deviceTypes, { desktop: 1 });
        assert.ok(result.lastSeenDate);
    });

    it('/questionnaire should update last seen date', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee({
            lastSeenDate: new Date(),
        });
        await insertIntoDatabase('trainee', trainee);

        await request(app).get(`/questionnaire/${trainee.token}`);
        await sleep(100);// Wait for data to be saved into MongoDB
        let result = await db.collection('trainee').findOne({ token: trainee.token });

        assert.ok(moment(result.lastSeenDate).isAfter(trainee.lastSeenDate));
    });

    it('/questionnaire should update device data when its a new session', async () => {

        let app = await startServer();
        let db = await getTestDatabase();
        let trainee = newTrainee({
            lastSeenDate: new Date(0),
            deviceTypes: {
                desktop: 1,
            }
        });
        await insertIntoDatabase('trainee', trainee);

        await request(app).get(`/questionnaire/${trainee.token}`);
        await sleep(100);// Wait for data to be saved into MongoDB
        let result = await db.collection('trainee').findOne({ token: trainee.token });

        assert.deepEqual(result.deviceTypes, { desktop: 2 });
    });

    it('/questionnaire should reject unknown token', async () => {

        let app = await startServer();

        let response = await request(app).get(`/questionnaire/UNKNOWN`);

        assert.equal(response.statusCode, 404);
    });
}));
