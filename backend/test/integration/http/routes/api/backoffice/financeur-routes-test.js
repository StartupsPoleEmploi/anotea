const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    it('can search all avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
                moderated: false,
                pseudo: 'joe'
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis')
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
        .get('/api/backoffice/financeur/avis?qualification=all')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 2);
    });

    it('can search stats', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({
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
                rates: {
                    accueil: 1,
                    contenu_formation: 1,
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
            accueil: 2.3333333333333335,
            accueil_1: 3,
            accueil_2: 2,
            accueil_3: 2,
            accueil_4: 0,
            accueil_5: 0,
            contenu_formation: 2.3333333333333335,
            contenu_formation_1: 3,
            contenu_formation_2: 2,
            contenu_formation_3: 2,
            contenu_formation_4: 0,
            contenu_formation_5: 0,
            equipe_formateurs: 2.3333333333333335,
            equipe_formateurs_1: 3,
            equipe_formateurs_2: 2,
            equipe_formateurs_3: 2,
            equipe_formateurs_4: 0,
            equipe_formateurs_5: 0,
            moyen_materiel: 2.3333333333333335,
            moyen_materiel_1: 3,
            moyen_materiel_2: 2,
            moyen_materiel_3: 2,
            moyen_materiel_4: 0,
            moyen_materiel_5: 0,
            accompagnement: 2.3333333333333335,
            accompagnement_1: 3,
            accompagnement_2: 2,
            accompagnement_3: 2,
            accompagnement_4: 0,
            accompagnement_5: 0,
            global: 2.3333333333333335,
            global_1: 3,
            global_2: 2,
            global_3: 2,
            global_4: 0,
            global_5: 0,
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

    it('can get departements', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/departements')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.length, 8);
        assert.deepStrictEqual(response.body[1], {
            code: '92',
            label: 'Hauts-de-Seine',
        });
    });

    it('can get organismes', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
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
            logAsFinanceur(app, 'financer@pole-emploi.fr', '2'),
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
