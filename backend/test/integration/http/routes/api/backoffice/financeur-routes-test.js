const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    it('can compute stats', async () => {

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
        .get('/api/backoffice/financeur/stats')
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
            nbNonConcernes: 0
        });
    });

    it('can get organismes', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `${33333333333333}`,
                    },
                }
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/organismes')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 1);
        assert.deepStrictEqual(response.body[0], {
            siren: '333333333',
            name: 'INSTITUT DE FORMATION',
            nbAvis: 1,
        });
    });

    it('can get formations', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `${33333333333333}`,
                    },
                }
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/organismes/33333333333333/formations')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 1);
        assert.deepStrictEqual(response.body[0], {
            idFormation: 'F_XX_XX',
            title: 'Développeur',
            nbAvis: 1,
        });
    });

}));
