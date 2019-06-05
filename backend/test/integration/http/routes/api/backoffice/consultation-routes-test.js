const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsOrganisme }) => {

    it('can reply to a comment', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222);
        let comment = newComment();
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .put(`/api/backoffice/organisme/avis/${comment._id}/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({ text: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.reponse.date);
        assert.deepStrictEqual(_.omit(response.body.reponse, ['date']), {
            text: 'Voici notre réponse',
            status: 'none',
        });
    });

    it('can delete an reponse', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222);
        let comment = newComment({
            reponse: {
                text: 'Voici notre réponse',
                status: 'published',
            }
        });
        await insertIntoDatabase('comment', comment);

        let response = await request(app)
        .put(`/api/backoffice/organisme/avis/${comment._id}/removeReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.reponse, undefined);
    });

    it('can report an commentaire', async () => {

        let app = await startServer();
        const comment = newComment();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222),
            insertIntoDatabase('comment', comment),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/organisme/avis/${comment._id}/report`)
        .send({ reason: 'alerte' })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.reported, true);
    });

    it('should reject invalid comment id', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', 2222222222222);

        let response = await request(app)
        .put(`/api/backoffice/organisme/avis/INVALID/addReponse`)
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
