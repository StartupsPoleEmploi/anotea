const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    it('can get organismes', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `${33333333333333}`,
                    },
                }
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/sirens')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 1);
        assert.deepStrictEqual(response.body[0], {
            siren: '333333333',
            name: 'INSTITUT DE FORMATION',
            nbAvis: 1,
        });
    });

}));
