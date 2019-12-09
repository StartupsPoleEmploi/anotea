const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');

describe(__filename, withServer(({ startServer }) => {

    it('can get all active regions', async () => {

        let app = await startServer();

        let response = await request(app)
        .get('/api/regions');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 16);
        assert.deepStrictEqual(response.body.find(r => r.codeRegion === '18'), {
            codeRegion: '18',
            nom: 'Provence-Alpes-Côte d\'Azur',
            email: 'anoteapepaca.13992@pole-emploi.fr'
        });
        assert.deepStrictEqual(response.body.find(r => r.codeRegion === null), {
            codeRegion: null,
            nom: 'Autre région',
            email: 'anotea@anotea.pole-emploi.fr'
        });
    });
}));

