const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newComment } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsFinanceur }) => {

    it('can search all avis', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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

    it('can not search without with another code financeur', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body.details[0].context.key, 'codeFinanceur');
    });

    it('can search without with another code financeur (pole emploi)', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '4'),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis?codeFinanceur=10')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
    });

    it('should not return avis from other region', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
            insertIntoDatabase('comment', newComment({ codeRegion: '6' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/financeur/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 0);
    });

    it('can compute stats', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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

    it('can get departements', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsFinanceur(app, 'financeur@pole-emploi.fr', '2'),
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
