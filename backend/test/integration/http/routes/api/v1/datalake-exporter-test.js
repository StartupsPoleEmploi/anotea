const request = require('supertest');
const assert = require('assert');
const createHMACSignature = require('../../../../../../src/jobs/data/auth/utils/createHMACSignature');
const { withServer } = require('../../../../../helpers/test-server');

describe('/api/ping', withServer(({ startServer, configuration }) => {

    it('can ping authenticated route with HMAC authentication (GET)', async () => {

        let app = await startServer();


        let response = await request(app)
        .get('/api/v1/ping/authenticated')
        .set('authorization', createHMACSignature('esd', '1234', 'GET', '/api/v1/ping/authenticated'));

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            user: 'esd'
        });
    });

}));

