const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newComment } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsOrganisme, getTestDatabase }) => {

    it('can answer to a comment', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222);
        let comment = newComment();
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/answer`)
        .set('authorization', `Bearer ${token}`)
        .send({ answer: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.answer.date);
        assert.deepStrictEqual(_.omit(response.body.answer, ['date']), {
            text: 'Voici notre réponse',
            status: 'published',
        });
    });

    it('can delete an answer', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222);
        let comment = newComment({
            answer: {
                text: 'Voici notre réponse',
                status: 'published',
            }
        });
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .delete(`/api/backoffice/avis/${comment._id}/answer`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.answer, undefined);
    });

    it('can report an avis', async () => {

        let app = await startServer();
        const comment = newComment();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${comment._id}/report`)
        .send({ reason: 'alerte' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.reported, true);
    });

    it('should reject invalid comment id', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222);

        let response = await request(app)
        .put(`/api/backoffice/avis/INVALID/answer`)
        .set('authorization', `Bearer ${token}`)
        .send({ answer: 'Voici notre réponse' });

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
