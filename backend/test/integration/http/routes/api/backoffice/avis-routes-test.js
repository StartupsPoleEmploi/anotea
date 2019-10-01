const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../../helpers/test-server');
const { newComment, newTrainee, newOrganismeAccount } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, logAsFinanceur, logAsOrganisme, createIndexes, getComponents, getTestDatabase }) => {

    it('can search all avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment()),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
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

    it('can search avis with status', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ published: true })),
            insertIntoDatabase('comment', newComment({ published: false, rejected: true })),
            insertIntoDatabase('comment', newComment({ moderated: false, published: false, rejected: false })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?status=published')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].published, true);

        response = await request(app)
        .get('/api/backoffice/avis?status=rejected')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].rejected, true);

        response = await request(app)
        .get('/api/backoffice/avis?status=none')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].moderated, false);
    });

    it('when moderateur should return only not archived avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ archived: false })),
            insertIntoDatabase('comment', newComment({ archived: true })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].archived, false);
    });

    it('when financeur should return archived and not archived avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('comment', newComment({ archived: false })),
            insertIntoDatabase('comment', newComment({ archived: true })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);
    });

    it('can search avis by email', async () => {
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

    it('can search avis by email (no match)', async () => {
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

    it('can search avis by titre', async () => {
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

    it('can search avis by titre (no match)', async () => {
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

    it('can search avis with pagination', async () => {

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

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 2);
        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 0,
            itemsPerPage: 2,
            itemsOnThisPage: 2,
            totalItems: 3,
            totalPages: 2
        });

        response = await request(app)
        .get('/api/backoffice/avis?page=1')
        .set('authorization', `Bearer ${token}`);

        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 1,
            itemsPerPage: 2,
            itemsOnThisPage: 1,
            totalItems: 3,
            totalPages: 2
        });
    });

    it('can search avis with reponse', async () => {
        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({
                reported: true,
            })),
            insertIntoDatabase('comment', newComment({
                reponse: {
                    text: 'Voici notre réponse',
                    status: 'published',
                },
            })),
            insertIntoDatabase('comment', newComment({
                reponse: {
                    text: 'Voici notre réponse',
                    status: 'rejected',
                },
            })),
            insertIntoDatabase('comment', newComment({
                reponse: {
                    text: 'Voici notre réponse',
                    status: 'none',
                },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?reponseStatus=published')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].reponse.status, 'published');

        response = await request(app)
        .get('/api/backoffice/avis?reponseStatus=rejected')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].reponse.status, 'rejected');

        response = await request(app)
        .get('/api/backoffice/avis?reponseStatus=none')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].reponse.status, 'none');
    });

    it('can search avis with qualification', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ qualification: 'positif' })),
            insertIntoDatabase('comment', newComment({ qualification: 'négatif' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?qualification=positif')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].qualification, 'positif');

        response = await request(app)
        .get('/api/backoffice/avis?qualification=négatif')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].qualification, 'négatif');
    });

    it('can search avis with siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111111111' } } })),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111122222' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=111111111')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);
    });

    it('can not search avis with siren when logged as organisme', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111111111' } } })),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111122222' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=111111111')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body.details[0].context.key, 'siren');
    });

    it('when logged as organisme should only returned avis with same siret', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111111111' } } })),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111122222' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].training.organisation.siret, '11111111111111');
    });

    it('can search avis by code financeur (PE)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('comment', newComment({ training: { codeFinanceur: '10' } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('can search avis by code financeur (conseil regional)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body.details[0].context.key, 'codeFinanceur');
    });

    it('should not filter by codeFinanceur when PE', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
            insertIntoDatabase('comment', newComment({ training: { codeFinanceur: '10' } })),
            insertIntoDatabase('comment', newComment({ training: { codeFinanceur: '2' } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);
    });

    it('should automatically filter by codeFinanceur when conseil regional', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({ training: { codeFinanceur: '10' } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('should not return avis from other region', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({ codeRegion: '6' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
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

    it('can create a reponse', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222');
        let comment = newComment();
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({ text: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.reponse.date);
        assert.deepStrictEqual(_.omit(response.body.reponse, ['date']), {
            text: 'Voici notre réponse',
            status: 'none',
        });
    });

    it('can remove a reponse', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222');
        let comment = newComment({
            reponse: {
                text: 'Voici notre réponse',
                status: 'published',
            }
        });
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/removeReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.reponse, undefined);
    });

    it('can report avis', async () => {

        let app = await startServer();
        const comment = newComment({ read: false });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/report`)
        .send({ report: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.reported, true);
        assert.deepStrictEqual(response.body.read, true);
    });

    it('can cancel report avis', async () => {

        let app = await startServer();
        const comment = newComment({ read: false });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/report`)
        .send({ report: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.reported, false);
        assert.deepStrictEqual(response.body.read, true);
    });

    it('can mark avis as read', async () => {

        let app = await startServer();
        const comment = newComment({ read: false });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/read`)
        .send({ read: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.read, true);
    });

    it('can mark avis as not read', async () => {

        let app = await startServer();
        const comment = newComment({ read: true });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/read`)
        .send({ read: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.read, false);
    });

    it('should reject invalid comment id', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222');

        let response = await request(app)
        .put(`/api/backoffice/avis/INVALID/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({ reponse: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Erreur de validation',
            details: [
                {
                    message: '"id" with value "INVALID" fails to match the Identifiant invalide pattern',
                    path: [
                        'id'
                    ],
                    type: 'string.regex.name',
                    context: {
                        name: 'Identifiant invalide',
                        pattern: {},
                        value: 'INVALID',
                        key: 'id',
                        label: 'id'
                    }
                }
            ]
        });
    });
}));
