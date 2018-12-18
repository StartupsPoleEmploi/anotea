const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');

describe('Server Security', withServer(({ startServer }) => {

    it('X-Powered-By is not set', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/v1/ping/anonymous');

        assert.equal(response.header['x-powered-by'], undefined);
        assert.equal(response.statusCode, 200);
    });
}));
