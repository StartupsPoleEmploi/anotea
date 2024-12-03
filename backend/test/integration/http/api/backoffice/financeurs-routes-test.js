const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');

describe(__filename, withServer(({ startServer, logAsFinanceur }) => {

    it('can get all financeurs', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@francetravail.fr', '2'),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeurs')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 15);
        assert.deepStrictEqual(response.body.find(r => r.code === '2'), {
            code: '2',
            label: 'Conseil régional',
        });
    });
}));

