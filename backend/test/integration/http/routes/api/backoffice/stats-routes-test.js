const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const { newComment, newTrainee } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur, logAsFinanceur, logAsOrganisme }) => {

    let buildComment = (custom = {}) => {
        return newComment(_.merge({
            codeRegion: '11',
            training: {
                organisation: { siret: '11111111111111' },
                codeFinanceur: ['10'],
            },
        }, custom));
    };

    let buildTrainee = (custom = {}) => {
        return newTrainee(_.merge({
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
                insertIntoDatabase('comment', buildComment({
                    rates: {
                        accueil: 3,
                        contenu_formation: 3,
                        equipe_formateurs: 3,
                        moyen_materiel: 3,
                        accompagnement: 3,
                        global: 3,
                    },
                })),
                insertIntoDatabase('comment', buildComment({
                    rates: {
                        accueil: 3,
                        contenu_formation: 3,
                        equipe_formateurs: 3,
                        moyen_materiel: 3,
                        accompagnement: 3,
                        global: 3,
                    },
                })),
                insertIntoDatabase('comment', buildComment({
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
                nbAModerer: 0,
                nbRead: 3,
                nbReponseAModerer: 0,
                nbSignales: 0,
            });
        });

        it(`[${profileName}] can compute stagiaires stats`, async () => {

            let app = await startServer();
            let [token] = await Promise.all([
                logUser(app),
                insertIntoDatabase('trainee', buildTrainee({
                    mailSent: true,
                })),
                insertIntoDatabase('trainee', buildTrainee({
                    mailSent: false,
                })),
            ]);

            let response = await request(app)
            .get('/api/backoffice/stats/stagiaires')
            .set('authorization', `Bearer ${token}`);

            assert.strictEqual(response.statusCode, 200);
            assert.deepStrictEqual(response.body, {
                total: 2,
                nbEmailsEnvoyes: 1,
            });
        });
    });

}));
