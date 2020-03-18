const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../helpers/with-server');

describe(__filename, withServer(({ startServer }) => {

    it('can get all active regions', async () => {

        let app = await startServer();

        let response = await request(app)
        .get('/api/regions');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 17);
        assert.deepStrictEqual(response.body.find(r => r.codeRegion === '93'), {
            codeRegion: '93',
            nom: 'Provence-Alpes-Côte d\'Azur',
            email: 'anoteapepaca.13992@pole-emploi.fr'
        });
    });
}));

