const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const { newAvis } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, logAsFinanceur, logAsOrganisme }) => {

    let buildAvis = (custom = {}) => {
        return newAvis(_.merge({
            codeRegion: '11',
            formation: {
                action: {
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        siret: '11111111111111',
                    },
                },
            },
        }, custom));
    };

    let profiles = (values, testCallback) => {
        let testParameters = [
            {
                profileName: 'moderateur',
                logUser: app => logAsModerateur(app, 'admin@pole-emploi.fr', { codeRegion: '11' }),
            },
            {
                profileName: 'financeur',
                logUser: app => logAsFinanceur(app, 'financeur@pole-emploi.fr', '10', { codeRegion: '11' }),
            },
            {
                profileName: 'organisme',
                logUser: app => logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111', { codeRegion: '11' }),
            }
        ];

        return testParameters.filter(p => values.includes(p.profileName)).forEach(testCallback);
    };

    it('can not search avis when not authenticated', async () => {

        let app = await startServer();

        let response = await request(app).get('/api/backoffice/avis');
        assert.strictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.body, { error: true });
    });

    profiles(['moderateur', 'financeur', 'organisme'], ({ profileName, logUser }) => {

        it(`[${profileName}] can search avis`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis()),
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

        it(`[${profileName}] can search avis with pagination`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logAsModerateur(app, 'admin@pole-emploi.fr'),
                insertIntoDatabase('avis', buildAvis()),
                insertIntoDatabase('avis', buildAvis()),
                insertIntoDatabase('avis', buildAvis()),
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

        it(`[${profileName}] can compute avis stats`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({
                    notes: {
                        accueil: 3,
                        contenu_formation: 3,
                        equipe_formateurs: 3,
                        moyen_materiel: 3,
                        accompagnement: 3,
                        global: 3,
                    },
                })),
                insertIntoDatabase('avis', buildAvis({
                    notes: {
                        accueil: 3,
                        contenu_formation: 3,
                        equipe_formateurs: 3,
                        moyen_materiel: 3,
                        accompagnement: 3,
                        global: 3,
                    },
                })),
                insertIntoDatabase('avis', buildAvis({
                    notes: {
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
            .get('/api/backoffice/avis/stats')
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
                nbCommentairesAModerer: 0,
                nbCommentairesValidated: 3,
                nbCommentairesRejected: 0,
                nbCommentairesReported: 0,
                nbCommentairesArchived: 0,
                nbCommentairesPositifs: 3,
                nbCommentairesNegatifs: 0,
                nbCommentairesAlertes: 0,
                nbCommentairesInjures: 0,
                nbCommentairesNonConcernes: 0,
                nbReponses: 0,
                nbReponseAModerer: 0,
                nbRead: 3,
            });
        });

        it(`[${profileName}] can compute avis stats (status)`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
                insertIntoDatabase('avis', buildAvis({ status: 'reported' })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis/stats')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.total, 2);
            assert.strictEqual(response.body.nbCommentaires, 2);
            assert.strictEqual(response.body.nbCommentairesValidated, 1);
            assert.strictEqual(response.body.nbCommentairesRejected, 0);
            assert.strictEqual(response.body.nbCommentairesReported, 1);
            assert.strictEqual(response.body.nbCommentairesArchived, 0);
        });

        it(`[${profileName}] can compute avis stats (notes)`, async () => {

            let app = await startServer();
            let avis = buildAvis({ status: 'validated' });
            delete avis.commentaire;
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', avis),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis/stats')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.total, 1);
            assert.strictEqual(response.body.nbCommentaires, 0);
            assert.strictEqual(response.body.nbCommentairesValidated, 0);
            assert.strictEqual(response.body.nbCommentairesRejected, 0);
            assert.strictEqual(response.body.nbCommentairesReported, 0);
            assert.strictEqual(response.body.nbCommentairesArchived, 0);
        });
    });

    profiles(['moderateur', 'financeur'], ({ profileName, logUser }) => {

        it(`[${profileName}] can search avis with commentaires`, async () => {

            let app = await startServer();
            let avis = buildAvis({ token: 'sans-commentaire' });
            delete avis.commentaire;

            let [token] = await Promise.all([
                logAsModerateur(app, 'admin@pole-emploi.fr'),
                insertIntoDatabase('avis', buildAvis({ token: 'avec-commentaire' })),
                insertIntoDatabase('avis', avis),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis?commentaires=true')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].token, 'avec-commentaire');

            response = await request(app)
            .get('/api/backoffice/avis?commentaires=false')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].token, 'sans-commentaire');
        });

        it(`[${profileName}] should not return avis from other region`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({ codeRegion: '6' })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 0);
        });
    });

    profiles(['financeur', 'organisme'], ({ profileName, logUser }) => {
        it(`[${profileName}] should not return avis à moderer`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
                insertIntoDatabase('avis', buildAvis({ status: 'none' })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.ok(response.body.avis[0].status, 'validated');
        });
    });

    profiles(['moderateur', 'organisme'], ({ profileName, logUser }) => {
        it(`[${profileName}] should not return archived avis`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
                insertIntoDatabase('avis', buildAvis({ status: 'archived' })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].status, 'validated');
        });

        it(`[${profileName}] can search avis with reponse`, async () => {
            let app = await startServer();
            let [token] = await Promise.all([
                logAsModerateur(app, 'admin@pole-emploi.fr'),
                insertIntoDatabase('avis', buildAvis({
                    reponse: {
                        text: 'Voici notre réponse',
                        status: 'validated',
                    },
                })),
                insertIntoDatabase('avis', buildAvis({
                    reponse: {
                        text: 'Voici notre réponse',
                        status: 'rejected',
                    },
                })),
                insertIntoDatabase('avis', buildAvis({
                    reponse: {
                        text: 'Voici notre réponse',
                        status: 'none',
                    },
                })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/avis?reponseStatuses=validated')
            .set('authorization', `Bearer ${token}`);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].reponse.status, 'validated');

            response = await request(app)
            .get('/api/backoffice/avis?reponseStatuses=rejected')
            .set('authorization', `Bearer ${token}`);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].reponse.status, 'rejected');

            response = await request(app)
            .get('/api/backoffice/avis?reponseStatuses=none')
            .set('authorization', `Bearer ${token}`);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.avis.length, 1);
            assert.strictEqual(response.body.avis[0].reponse.status, 'none');
        });
    });

}));
