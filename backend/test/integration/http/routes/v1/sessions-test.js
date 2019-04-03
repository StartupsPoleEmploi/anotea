const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const ObjectID = require('mongodb').ObjectID;
const { newComment, randomize, newIntercarif, newSession } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    it('can return session by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let sessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109418';
        let commentId = new ObjectID();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: sessionId,
                numero: 'SE_0000109418',
                region: '11',
                avis: [
                    newComment({
                        _id: commentId,
                        pseudo: pseudo,
                        formacode: '22252',
                        idSession: 'SE_0000109418',
                        training: {
                            idFormation: '14_AF_0000010729',
                            formacode: '22252',
                            organisation: {
                                siret: '82422814200108',
                            },
                            place: {
                                postalCode: '77420',
                            },
                            infoCarif: {
                                numeroAction: '14_SE_0000109418',
                                numeroSession: 'SE_0000109418'
                            },
                        }
                    }, date),
                ],
            }))
        ]);

        let response = await request(app).get(`/api/v1/sessions/${sessionId}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: sessionId,
            region: '11',
            numero: 'SE_0000109418',
            score: {
                nb_avis: 1,
                notes: {
                    accompagnement: 4,
                    accueil: 4,
                    contenu_formation: 4,
                    equipe_formateurs: 4,
                    global: 4,
                    moyen_materiel: 4,
                }
            },
            meta: {
                reconciliation: {
                    certifinfos: ['55518'],
                    formacodes: ['31801'],
                    lieu_de_formation: '75019',
                    organisme_formateur: '22222222222222',
                },
                source: {
                    numero_formation: '14_AF_0000010729',
                    numero_action: '14_SE_0000109418',
                    numero_session: 'SE_0000109418',
                    type: 'intercarif',
                }
            },
            avis: [{
                id: commentId.toString(),
                pseudo,
                date: date.toJSON(),
                commentaire: {
                    titre: 'Génial',
                    texte: 'Super formation.',
                },
                notes: {
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2
                },
                formation: {
                    numero: '14_AF_0000010729',
                    intitule: 'Développeur',
                    domaine_formation: {
                        formacodes: [
                            '22252'
                        ]
                    },
                    certifications: [
                        {
                            certif_info: '78997'
                        }
                    ],
                    action: {
                        numero: '14_SE_0000109418',
                        lieu_de_formation: {
                            code_postal: '77420',
                            ville: 'Paris'
                        },
                        organisme_financeurs: [],
                        organisme_formateur: {
                            raison_sociale: 'INSTITUT DE FORMATION',
                            siret: '82422814200108',
                            numero: '14_OF_XXXXXXXXXX',
                        },
                        session: {
                            numero: 'SE_0000109418',
                            periode: {
                                debut: date.toJSON(),
                                fin: date.toJSON()
                            }
                        }
                    }
                }
            }]
        });
    });

    it('should return session with rejected avis', async () => {

        let app = await startServer();
        let date = new Date();
        let sessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109418';
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: sessionId,
                numero: 'SE_0000109418',
                region: '11',
                avis: [
                    newComment({
                        rejected: true,
                        comment: {
                            title: 'WTF',
                            text: 'WTF',
                        },
                    }, date),
                ],
            }))
        ]);

        let response = await request(app).get(`/api/v1/sessions/${sessionId}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis[0].commentaire, undefined);
    });

    it('should fail when numero de session is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/sessions/UNKNOWN`);

        assert.strictEqual(response.statusCode, 404);
        assert.deepStrictEqual(response.body, {
            error: 'Not Found',
            message: 'Numéro de session inconnu ou session expirée',
            statusCode: 404,
        });
    });

    it('can search trough all sessions', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109411' })),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109412' })),
        ]);

        let response = await request(app).get('/api/v1/sessions');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_0000109411'));
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_0000109412'));
    });

    it('can search though all sessions filtered by ids', async () => {

        let app = await startServer();
        let firstSessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109411';
        let secondSessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109412';
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: firstSessionId })),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: secondSessionId })),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_000010456' })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?id=${firstSessionId},${secondSessionId}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_0000109411'));
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_0000109412'));
    });

    it('can search though all sessions filtered by region', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109411',
                region: '11',
            })),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109413',
                region: '24'
            })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?region=11`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418|SE_0000109411'));
    });

    it('can search though all sessions filtered by numero', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109411',
                numero: 'SE_XXXXX1'
            })),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109413',
                numero: 'SE_XXXXX3'
            })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?numero=SE_XXXXX1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418|SE_0000109411'));
    });

    it('can search though all sessions filtered by nb_avis', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109411',
                score: {
                    nb_avis: 1,
                },
            })),
            insertIntoDatabase('sessionsReconciliees', newSession({
                _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109413',
                score: {
                    nb_avis: 0,
                },
            })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?nb_avis=1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418|SE_0000109411'));
    });

    it('can search though all sessions with pagination', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109411' })),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_0000109412' })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?page=0&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);

        response = await request(app).get(`/api/v1/sessions?page=1&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 1,
            total_items: 2,
            total_pages: 2,
        });
    });

    it('should fail when items_per_page is too big', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/sessions?page=0&items_par_page=5000`);

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Erreur de validation',
            details: [
                {
                    message: '"items_par_page" must be less than or equal to 2000',
                    path: [
                        'items_par_page'
                    ],
                    type: 'number.max',
                    context: {
                        limit: 2000,
                        value: 5000,
                        key: 'items_par_page',
                        label: 'items_par_page'
                    }
                }
            ]
        });
    });

    it('can search though all sessions with projection (inclusion)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_000010456' })),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.sessions[0]), ['id', 'score']);
    });

    it('can search though all sessions with projection (exclusion)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_000010456' })),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.sessions[0]), ['id', 'numero', 'region', 'score', 'meta']);
    });

    it('can get score with notes décimales', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('sessionsReconciliees', newSession({ _id: '14_AF_0000010729|14_SE_0000109418|SE_000010456' })),
        ]);

        let response = await request(app).get('/api/v1/sessions?notes_valeurs_decimales=true');
        assert.deepStrictEqual(response.body.sessions[0].score, {
            nb_avis: 1,
            notes: {
                accompagnement: 4.1,
                accueil: 4.1,
                contenu_formation: 4.1,
                equipe_formateurs: 4.1,
                global: 4.1,
                moyen_materiel: 4.1,
            }
        });

        response = await request(app).get('/api/v1/sessions/14_AF_0000010729|14_SE_0000109418|SE_000010456?notes_valeurs_decimales=true');
        assert.deepStrictEqual(response.body.score, {
            nb_avis: 1,
            notes: {
                accompagnement: 4.1,
                accueil: 4.1,
                contenu_formation: 4.1,
                equipe_formateurs: 4.1,
                global: 4.1,
                moyen_materiel: 4.1,
            }
        });
    });

}));
