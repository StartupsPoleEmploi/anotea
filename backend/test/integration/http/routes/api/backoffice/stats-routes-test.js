const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur, logAsModerateur }) => {

    it('can compute avis stats', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                training: { codeFinanceur: '2' },
                rates: {
                    accueil: 3,
                    contenu_formation: 3,
                    equipe_formateurs: 3,
                    moyen_materiel: 3,
                    accompagnement: 3,
                    global: 3,
                },
            })),
            insertIntoDatabase('comment', newComment({
                training: { codeFinanceur: '2' },
                rates: {
                    accueil: 3,
                    contenu_formation: 3,
                    equipe_formateurs: 3,
                    moyen_materiel: 3,
                    accompagnement: 3,
                    global: 3,
                },
            })),
            insertIntoDatabase('comment', newComment({
                training: { codeFinanceur: '2' },
                rates: {
                    accueil: 2,
                    contenu_formation: 2,
                    equipe_formateurs: 1,
                    moyen_materiel: 1,
                    accompagnement: 1,
                    global: 1,
                },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/stats/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            total: 3,
            notes: {
                accueil: {
                    moyenne: 2.7,
                    1: 0,
                    2: 1,
                    3: 2,
                    4: 0,
                    5: 0,
                },
                contenu_formation: {
                    moyenne: 2.7,
                    1: 0,
                    2: 1,
                    3: 2,
                    4: 0,
                    5: 0,
                },
                equipe_formateurs: {
                    moyenne: 2.3,
                    1: 1,
                    2: 0,
                    3: 2,
                    4: 0,
                    5: 0,
                },
                moyen_materiel: {
                    moyenne: 2.3,
                    1: 1,
                    2: 0,
                    3: 2,
                    4: 0,
                    5: 0,
                },
                accompagnement: {
                    moyenne: 2.3,
                    1: 1,
                    2: 0,
                    3: 2,
                    4: 0,
                    5: 0,
                },
                global: {
                    moyenne: 2.3,
                    1: 1,
                    2: 0,
                    3: 2,
                    4: 0,
                    5: 0,
                },
            },
            nbNotesSeules: 0,
            nbCommentaires: 3,
            nbPublished: 3,
            nbRejected: 0,
            nbPositifs: 3,
            nbNegatifs: 0,
            nbAlertes: 0,
            nbInjures: 0,
            nbNonConcernes: 0,
            nbReponses: 0,
        });
    });

    it('can compute moderation stats', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsModerateur(app, 'admin@pole-emploi.fr'),
            insertIntoDatabase('comment', newComment({ reported: true })),
            insertIntoDatabase('comment', newComment({ reponse: { status: 'none' } })),
            insertIntoDatabase('comment', newComment({ reported: true, archived: true })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/stats/moderation')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            none: 0,
            reported: 1,
            reponse: {
                none: 1
            }
        });
    });
}));
