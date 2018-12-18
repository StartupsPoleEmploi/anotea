const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');

describe(__filename, withServer(({ startServer, logAsModerateur }) => {

    it('can retrieve all advices when authenticated', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .get('/api/backoffice/advices/11?filter=all&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.ok(response.body.advices);
    });

    it('can not retrieve advices when not authenticated', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/backoffice/advices/11?filter=all&order=moderation');
        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });
}));
