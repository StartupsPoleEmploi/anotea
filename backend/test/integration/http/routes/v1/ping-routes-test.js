const request = require('supertest');
const assert = require('assert');
const moment = require('moment');
const crypto = require('crypto');
const { withServer } = require('../../../../helpers/test-server');

describe('/api/ping', withServer(({ startServer }) => {

    it('can ping api as anonymous', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/v1/ping/anonymous');

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            user: 'anonymous'
        });
    });

    it('can ping authenticated route with api credentials', async () => {

        let app = await startServer();
        let timestamp = new Date().getTime();
        let digest = crypto.createHmac('sha256', '1234')
        .update(`${timestamp}GET/api/v1/ping/authenticated`)
        .digest('hex');

        let response = await request(app)
        .get('/api/v1/ping/authenticated')
        .set('authorization', `ANOTEA-HMAC-SHA256 esd:${timestamp}:${digest}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            user: 'esd'
        });
    });

    it('can ping authenticated route with api credentials (method POST)', async () => {

        let app = await startServer();
        let timestamp = new Date().getTime();
        let payload = { value: 1 };
        let digest = crypto.createHmac('sha256', '1234')
        .update(`${timestamp}POST/api/v1/ping/authenticated${JSON.stringify(payload)}`)
        .digest('hex');

        let response = await request(app)
        .post('/api/v1/ping/authenticated')
        .set('authorization', `ANOTEA-HMAC-SHA256 esd:${timestamp}:${digest}`)
        .send(payload);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            user: 'esd'
        });
    });

    it('can ping authenticated route with not formatted json body', async () => {

        let app = await startServer();
        let timestamp = new Date().getTime();
        let notFormattedPayload = '{  "value": 1}';
        let digest = crypto.createHmac('sha256', '1234')
        .update(`${timestamp}POST/api/v1/ping/authenticated${notFormattedPayload}`)
        .digest('hex');

        let response = await request(app)
        .post('/api/v1/ping/authenticated')
        .set('authorization', `ANOTEA-HMAC-SHA256 esd:${timestamp}:${digest}`)
        .set('Content-Type', 'application/json')
        .send(notFormattedPayload);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            user: 'esd'
        });
    });

    it('can not ping authenticated route without api credentials', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/v1/ping/authenticated');

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Cette resource doit être appelée avec un header Authorization: ANOTEA-HMAC-SHA256 <yourApiKey>:<timestamp>:<sha256-hmac-digest>',
            statusCode: 401,
        });
    });

    it('can not ping authenticated route with invalid api credentials', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/v1/ping/authenticated')
        .set('authorization', `ANOTEA-HMAC-SHA256 UNKONWN:36c661a587a7daf5814f7f9f25b3478714521db4bb0f10ff95e118105c5d40e6:456`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Clé d\'api inconnue',
            statusCode: 401,
        });
    });

    it('can not ping authenticated route with invalid signature', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/v1/ping/authenticated')
        .set('authorization', `ANOTEA-HMAC-SHA256 esd:36c661a587a7daf5814f7f9f25b3478714521db4bb0f10ff95e118105c5d40e6:456`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Le header Authorization contient une signature invalide',
            statusCode: 401,
        });
    });

    it('can not ping authenticated route without an old timestamp api credentials', async () => {

        let app = await startServer();
        let timestamp = moment().subtract(6, 'minutes').valueOf();
        let signature = crypto.createHmac('sha256', '1234')
        .update(`${timestamp}GET/api/v1/ping/authenticated`)
        .digest('hex');

        let response = await request(app)
        .get('/api/v1/ping/authenticated')
        .set('authorization', `ANOTEA-HMAC-SHA256 esd:${timestamp}:${signature}`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Le header Authorization est expiré (durée de vie 300s)',
            statusCode: 401,
        });
    });

    it('can ping api to generate a sample error', async () => {

        let app = await startServer();
        let httpCode = 500;

        let response = await request(app).get(`/api/v1/ping/error?http_code=${httpCode}`);

        assert.equal(response.statusCode, httpCode);
        assert.deepEqual(response.body, {
            error: 'Internal Server Error',
            message: 'An internal server error occurred',
            statusCode: 500,
        });
    });
}));

