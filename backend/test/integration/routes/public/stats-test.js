const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../helpers/test-server');

describe('/api/stats', withServer(({ startServer }) => {

    it('can get stats', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/v1/stats.json');

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, []);
    });

}));
