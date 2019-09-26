const request = require('supertest');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../../helpers/test-server');
const { newComment, newTrainee, newOrganismeAccount } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, logAsModerateur, logAsOrganisme, logAsFinanceur, insertIntoDatabase, getTestDatabase, getComponents }) => {

    it('can publish reponse', async () => {

        let app = await startServer();
        let comment = newComment();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/publishReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.reponse.lastStatusUpdate);
        assert.deepStrictEqual(response.body.reponse.status, 'published');
    });

    it('can reject reponse', async () => {

        let app = await startServer();
        let comment = newComment();
        let organisme = newOrganismeAccount({ SIRET: parseInt(comment.training.organisation.siret) });
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', comment),
            insertIntoDatabase('accounts', organisme)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/rejectReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.reponse.lastStatusUpdate);
        assert.deepStrictEqual(response.body.reponse.status, 'rejected');

        let { mailer } = await getComponents();
        let email = mailer.getCalls()[0];
        assert.deepStrictEqual(email[0], { to: 'contact@poleemploi-formation.fr' });
    });


    it('can edit an avis', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/edit`)
        .send({ text: 'New message' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.editedComment.text, 'New message');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can publish an avis', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id, token: '12345' })),
            insertIntoDatabase('trainee', newTrainee({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/publish`)
        .send({ qualification: 'positif' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.moderated, true);
        assert.deepStrictEqual(response.body.published, true);
        assert.deepStrictEqual(response.body.reported, false);
        assert.deepStrictEqual(response.body.rejectReason, null);
        assert.deepStrictEqual(response.body.qualification, 'positif');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can reject an avis', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id, token: '12345' })),
            insertIntoDatabase('trainee', newTrainee({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/reject`)
        .send({ reason: 'injure' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.moderated, true);
        assert.deepStrictEqual(response.body.published, false);
        assert.deepStrictEqual(response.body.rejected, true);
        assert.deepStrictEqual(response.body.reported, false);
        assert.deepStrictEqual(response.body.rejectReason, 'injure');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can delete an avis', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id })),
        ]);

        let response = await request(app)
        .delete(`/api/backoffice/avis/${id}`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        let db = await getTestDatabase();
        let count = await db.collection('comment').countDocuments({ _id: id });
        assert.strictEqual(count, 0);
    });

    it('can mask pseudo', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/pseudo`)
        .send({ mask: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.pseudoMasked, true);
    });

    it('can unmask pseudo', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/pseudo`)
        .send({ mask: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.pseudoMasked, false);
    });

    it('can mask title', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/title`)
        .send({ mask: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.titleMasked, true);
    });

    it('can unmask title', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/title`)
        .send({ mask: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.titleMasked, false);
    });

    it('can not reject unknown avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${new ObjectID()}/reject`)
        .send({ reason: 'alerte' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can not search avis when not authenticated', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/backoffice/avis');
        assert.strictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.body, { error: true });
    });
}));
