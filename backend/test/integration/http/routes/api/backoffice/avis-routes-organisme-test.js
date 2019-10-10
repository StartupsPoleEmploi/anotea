const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsOrganisme }) => {

    it('can search avis from other region', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111', { codeRegion: '11' }),
            insertIntoDatabase('comment', newComment({
                codeRegion: '6',
                training: { organisation: { siret: '11111111111111' } },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('can search avis with siret', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111122222' } } })),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111111111' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=11111111111111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].training.organisation.siret, '11111111111111');
    });

    it('can search avis with siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111122222' } } })),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '22222222222222' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=111111111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].training.organisation.siret, '11111111122222');
    });

    it('can not search avis with another siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111122222' } } })),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '22222222222222' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=22222222222222')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body.details[0].context.key, 'siren');
    });

    it('should automatically search avis with organisme siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '11111111111111' } } })),
            insertIntoDatabase('comment', newComment({ training: { organisation: { siret: '22222222222222' } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].training.organisation.siret, '11111111111111');
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
        let reponse = response.body.reponse;
        assert.ok(reponse.date);
        assert.ok(reponse.lastStatusUpdate);
        assert.strictEqual(reponse.date, reponse.lastStatusUpdate);
        assert.deepStrictEqual(_.omit(reponse, ['date', 'lastStatusUpdate']), {
            text: 'Voici notre réponse',
            status: 'none',
        });
    });

    it('can not create reponse with invalid comment id', async () => {

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

}));
