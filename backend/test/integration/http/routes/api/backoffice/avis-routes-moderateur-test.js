const _ = require('lodash');
const waitUntil = require('wait-until');
const request = require('supertest');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../../helpers/with-server');
const { newComment, newTrainee, newOrganismeAccount } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, createIndexes, getComponents, getTestDatabase }) => {

    let buildComment = (custom = {}) => {
        return newComment(_.merge({
            codeRegion: '11',
            training: {
                organisation: { siret: '11111111111111' },
                codeFinanceur: ['10'],
            },
        }, custom));
    };

    it(`can search avis with status`, async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', buildComment({ status: 'published' })),
            insertIntoDatabase('comment', buildComment({ status: 'rejected' })),
            insertIntoDatabase('comment', buildComment({ status: 'reported' })),
            insertIntoDatabase('comment', buildComment({ status: 'none' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?statuses=published')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'published');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=rejected')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'rejected');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=reported')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'reported');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=none')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'none');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=archived')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);
    });

    it('can search avis by email (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('trainee', newTrainee({
                token: '12345',
                trainee: {
                    email: 'robert@domaine.com',
                },
            })),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
                pseudo: 'kikoo',
                token: '12345',
            })),
            createIndexes(['comment']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=robert@domaine.com')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('can search avis by email (no match) (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment()),
            createIndexes(['comment']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=unknown@unknown.com')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('can search avis by titre (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({
                pseudo: 'pseudo',
                comment: {
                    title: 'Trop Génial',
                },
            })),
            insertIntoDatabase('comment', newComment({
                comment: {
                    title: 'Pas cool',
                },
            })),
            createIndexes(['comment']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=Trop')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].pseudo, 'pseudo');
    });

    it('can search avis by titre (no match) (fulltext)', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment()),
            createIndexes(['comment']),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?fulltext=NOMATCH')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

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

    it('can not publish reponse of another region', async () => {

        let app = await startServer();
        let comment = newComment({ codeRegion: '6' });
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/publishReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
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
        return new Promise((resolve, reject) => {
            waitUntil()
            .interval(100)
            .times(10)
            .condition(() => mailer.getCalls().length > 0)
            .done(result => {
                if (!result) {
                    reject(new Error('The condition was never met.'));
                }
                let params = mailer.getCalls()[0];
                assert.deepStrictEqual(params[0], { to: 'contact@poleemploi-formation.fr' });
                resolve();
            });
        });
    });

    it('can not reject reponse of another region', async () => {

        let app = await startServer();
        let comment = newComment({ codeRegion: '6' });
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/rejectReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can edit an avis', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({
                _id: id,
                comment: {
                    text: 'Génial'
                },
            })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/edit`)
        .send({ text: 'New message' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.comment.text, 'New message');
        assert.deepStrictEqual(response.body.meta.history[0].comment.text, 'Génial');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can not edit an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({
                _id: id,
                codeRegion: '7',
                comment: {
                    text: 'Génial'
                },
            })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/edit`)
        .send({ text: 'New message' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
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
        assert.deepStrictEqual(response.body.status, 'published');
        assert.deepStrictEqual(response.body.qualification, 'positif');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can not publish an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id, token: '12345', codeRegion: '7' })),
            insertIntoDatabase('trainee', newTrainee({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/publish`)
        .send({ qualification: 'positif' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
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
        .send({ qualification: 'injure' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.status, 'rejected');
        assert.deepStrictEqual(response.body.qualification, 'injure');
        assert.ok(response.body.lastStatusUpdate);
    });

    it('can not reject an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id, token: '12345', codeRegion: '7' })),
            insertIntoDatabase('trainee', newTrainee({ _id: new ObjectID(), token: '12345' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/reject`)
        .send({ qualification: 'injure' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
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

    it('can not delete an avis of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id, codeRegion: '7' })),
        ]);

        let response = await request(app)
        .delete(`/api/backoffice/avis/${id}`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });


    it('can un/mask pseudo', async () => {

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

        response = await request(app)
        .put(`/api/backoffice/avis/${id}/pseudo`)
        .send({ mask: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.pseudoMasked, false);
    });

    it('can not un/mask pseudo of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id, codeRegion: '7' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/pseudo`)
        .send({ mask: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can un/mask title', async () => {

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
        assert.deepStrictEqual(response.body.comment.titleMasked, true);

        response = await request(app)
        .put(`/api/backoffice/avis/${id}/title`)
        .send({ mask: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.comment.titleMasked, false);
    });

    it('can not un/mask title of another region', async () => {

        let app = await startServer();
        const id = new ObjectID();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ _id: id, codeRegion: '7' })),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${id}/title`)
        .send({ mask: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can not reject unknown avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${new ObjectID()}/reject`)
        .send({ qualification: 'alerte' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });
}));
