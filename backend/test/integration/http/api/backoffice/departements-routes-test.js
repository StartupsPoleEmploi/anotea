const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');

describe(__filename, withServer(({ startServer, logAsFinanceur }) => {

    it('can get departements', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@francetravail.fr', '2'),
        ]);

        let response = await request(app)
        .get('/api/backoffice/departements')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 8);
        assert.deepStrictEqual(response.body[1], {
            code: '92',
            label: 'Hauts-de-Seine',
        });
    });

}));

