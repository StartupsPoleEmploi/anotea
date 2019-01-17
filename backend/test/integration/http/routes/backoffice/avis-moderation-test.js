const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newComment, newTrainee } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, logAsModerateur, logAsOrganisme, logAsFinancer, insertIntoDatabase, createIndexes }) => {

    it('can search all avis with filter', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({
                pseudo: 'joe'
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?filter=all&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepEqual(response.body.avis.length, 1);
    });

    it('can search all avis with pseudo in avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
                pseudo: 'Joe',
            })),
            createIndexes('comment')
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?query=Joe&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepEqual(response.body.avis.length, 1);
        assert.deepEqual(response.body.avis[0].pseudo, 'Joe');
    });

    it('can search all avis with title in avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
                comment: {
                    title: 'awesome',
                },
            })),
            createIndexes('comment')
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?query=awesome&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepEqual(response.body.avis.length, 1);
        assert.deepEqual(response.body.avis[0].comment.title, 'awesome');
    });

    it('can search all avis with email', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('trainee', newTrainee({
                token: '12345',
                trainee: {
                    email: 'robert@domaine.com',
                },
            })),
            insertIntoDatabase('comment', newComment({
                pseudo: 'kikoo',
                token: '12345',
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?query=robert@domaine.com&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepEqual(response.body.avis.length, 1);
    });

    it('can search all avis with pagination', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment()),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?page=0')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepEqual(response.body.avis.length, 2);
        assert.deepEqual(response.body.meta.pagination, {
            page: 0,
            itemsPerPage: 2,
            itemsOnThisPage: 2,
            totalItems: 3,
            totalPages: 2
        });

        response = await request(app)
        .get('/api/backoffice/avis?page=1')
        .set('authorization', `Bearer ${token}`);

        assert.deepEqual(response.body.meta.pagination, {
            page: 1,
            itemsPerPage: 2,
            itemsOnThisPage: 1,
            totalItems: 3,
            totalPages: 2
        });
    });

    it('should return inventory', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ rejected: true, published: false })),
            insertIntoDatabase('comment', newComment({ published: true })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body.meta.inventory, {
            reported: 0,
            toModerate: 0,
            rejected: 1,
            published: 1,
            all: 2
        });
    });

    it('can not search avis when not authenticated', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/backoffice/avis?filter=all&order=moderation');
        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });

    it('can not search advices when authenticated as organisme', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 11111111111111);

        let response = await request(app).get('/api/backoffice/avis?filter=all&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });

    it('can not search advices when authenticated as financer', async () => {

        let app = await startServer();

        let token = await logAsFinancer(app, 'organisme@pole-emploi.fr', '2');

        let response = await request(app).get('/api/backoffice/avis?filter=all&order=moderation')
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });
}));
