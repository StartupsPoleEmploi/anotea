const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');

describe(__filename, withServer(({ startServer, logAsModerateur, logAsOrganisme, logAsFinancer }) => {

    it('can retrieve all avis when authenticated', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .get('/api/backoffice/avis/11?filter=all&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.ok(response.body.avis);
    });

    it('can not retrieve avis when not authenticated', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/backoffice/avis/11?filter=all&order=moderation');
        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });

    it('can not retrieve advices when authenticated as organisme', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 11111111111111);

        let response = await request(app).get('/api/backoffice/avis/11?filter=all&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });

    it('can not retrieve advices when authenticated as financer', async () => {

        let app = await startServer();

        let token = await logAsFinancer(app, 'organisme@pole-emploi.fr', '2');

        let response = await request(app).get('/api/backoffice/avis/11?filter=all&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });
}));
