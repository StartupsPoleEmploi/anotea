const request = require('supertest');
const assert = require('assert');
const regions = require('../../../../../config/regions');
const { withServer } = require('../../../../helpers/test-server');

describe(__filename, withServer(({ startServer }) => {

    it('can get all regions', async () => {

        let app = await startServer();

        let response = await request(app)
        .get('/api/regions');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 17);
        assert.deepStrictEqual(response.body.find(r => r.codeRegion === '17'), regions.find(r => r.codeRegion === '17'));
        assert.strictEqual(response.body.filter(r => r.codeRegion === '9').length, 1);
    });

    it('can get active regions', async () => {

        let app = await startServer();
        let response = await request(app)
        .get('/api/regions?active=true');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.filter(r => r.codeRegion === '17').length, 1);
        assert.strictEqual(response.body.filter(r => r.codeRegion === '9').length, 0);
    });


}));

