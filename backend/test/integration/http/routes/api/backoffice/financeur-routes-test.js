const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    it('can search all avis with filter', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                moderated: false,
                pseudo: 'joe'
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis?status=all')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.meta, {
            pagination: {
                page: 0,
                itemsPerPage: 2,
                itemsOnThisPage: 1,
                totalItems: 1,
                totalPages: 1
            }
        });
    });

    it('can search avis with status=all (return avis with and without commentaires)', async () => {

        let app = await startServer();
        let avisWithoutComment = insertIntoDatabase('comment', newComment());
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment()),
            avisWithoutComment,
        ]);

        delete avisWithoutComment.comment;

        let response = await request(app)
        .get('/api/backoffice/financeur/avis?status=all')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 2);
    });

    it('can search avis with status=rejected', async () => {

        let app = await startServer();
        let [token, avisWithoutComment] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
                rejected: true,
            })),
        ]);

        delete avisWithoutComment.comment;

        let response = await request(app)
        .get('/api/backoffice/financeur/avis?status=rejected')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 1);
    });

    it('can search all avis with pagination', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment()),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis?page=0')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 2);
        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 0,
            itemsPerPage: 2,
            itemsOnThisPage: 2,
            totalItems: 3,
            totalPages: 2
        });

        response = await request(app)
        .get('/api/backoffice/financeur/avis?page=1')
        .set('authorization', `Bearer ${token}`);

        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 1,
            itemsPerPage: 2,
            itemsOnThisPage: 1,
            totalItems: 3,
            totalPages: 2
        });
    });

    it('can search avis with qualification', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({ qualification: 'positif' })),
            insertIntoDatabase('comment', newComment({ qualification: 'négatif' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis?qualification=positif')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].qualification, 'positif');
    });

    it('can search avis with commentaires', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({ qualification: 'positif' })),
            insertIntoDatabase('comment', newComment({ qualification: 'négatif' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis.json?qualification=all')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 2);
    });

}));
