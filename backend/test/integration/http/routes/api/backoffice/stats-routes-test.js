const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const { newAvis, newStagiaire } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, logAsFinanceur, logAsOrganisme }) => {

    let buildAvis = (custom = {}) => {
        return newAvis(_.merge({
            codeRegion: '11',
            training: {
                organisation: { siret: '11111111111111' },
                codeFinanceur: ['10'],
            },
        }, custom));
    };

    let buildStagiaire = (custom = {}) => {
        return newStagiaire(_.merge({
            codeRegion: '11',
            training: {
                organisation: { siret: '11111111111111' },
                codeFinanceur: ['10'],
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

    profiles(['moderateur', 'financeur', 'organisme'], ({ profileName, logUser }) => {

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
            .get('/api/backoffice/stats/avis')
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
            .get('/api/backoffice/stats/avis')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.body.total, 1);
            assert.strictEqual(response.body.nbCommentaires, 0);
            assert.strictEqual(response.body.nbCommentairesValidated, 0);
            assert.strictEqual(response.body.nbCommentairesRejected, 0);
            assert.strictEqual(response.body.nbCommentairesReported, 0);
            assert.strictEqual(response.body.nbCommentairesArchived, 0);
        });

        it(`[${profileName}] can compute stagiaires stats`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('stagiaires', buildStagiaire({
                    mailSent: true,
                    mailSentDate: new Date()
                })),
                insertIntoDatabase('stagiaires', buildStagiaire({
                    mailSent: null,
                    mailSentDate: new Date()
                })),
                insertIntoDatabase('stagiaires', buildStagiaire({
                    mailSent: false,
                    mailSentDate: null
                })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/stats/stagiaires')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.deepStrictEqual(response.body, {
                total: 3,
                nbEmailsEnvoyes: 2,
            });
        });
    });

}));
