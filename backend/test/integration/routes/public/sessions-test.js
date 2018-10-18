const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../helpers/test-server');
const ObjectID = require('mongodb').ObjectID;
const { newComment, randomize, newFormation, newSession } = require('../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    const buildNewSession = (id, options = {}) => {

        let [numeroFormation, numeroAction, numeroSession] = id.split('|');

        let data = _.merge({
            _id: id,
            numero: 'SE_XXXXXX',
            region: '11',
            meta: {
                source: {
                    type: 'intercarif',
                    numero_formation: numeroFormation,
                    numero_action: numeroAction,
                    numero_session: numeroSession,
                }
            }
        }, options.session || {});

        let newComments = (options.comments || []).map(comment => {
            return newComment(_.merge({
                formacode: '22252',
                idSession: numeroSession,
                training: {
                    idFormation: numeroFormation,
                    formacode: '22252',
                    organisation: {
                        siret: '82422814200108',
                    },
                    place: {
                        postalCode: '77420',
                    },
                    infoCarif: {
                        numeroAction: numeroAction,
                        numeroSession: numeroSession
                    },
                }
            }, comment), options.date || new Date());
        });

        return newSession(data, newComments);
    };

    it('can return session by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let sessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109418';
        let commentId = new ObjectID();
        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession(sessionId, {
                comments: [{
                    _id: commentId,
                    pseudo: pseudo,
                }],
                date,
            }))
        ]);

        let response = await request(app).get(`/api/v1/sessions/${sessionId}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            id: sessionId,
            region: '11',
            numero: 'SE_XXXXXX',
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
                    lieu_de_formation: '49000',
                    organisme_formateur: '11111111111111',
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
                            siret: '82422814200108'
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

    it('should fail when numero de session is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/sessions/UNKNOWN`);

        assert.equal(response.statusCode, 404);
        assert.deepEqual(response.body, {
            error: 'Not Found',
            message: 'Numéro de session inconnu ou session expirée',
            statusCode: 404,
        });
    });

    it('can search trough all sessions', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109411')),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109412')),
        ]);

        let response = await request(app).get('/api/v1/sessions');

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.meta.source.numero_session === 'SE_0000109411'));
        assert.ok(response.body.sessions.find(s => s.meta.source.numero_session === 'SE_0000109412'));
    });

    it('can search though all sessions filtered by ids', async () => {

        let app = await startServer();
        let firstSessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109411';
        let secondSessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109412';
        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession(firstSessionId)),
            insertIntoDatabase('sessionsReconciliees', buildNewSession(secondSessionId)),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_000010456')),
        ]);

        let response = await request(app).get(`/api/v1/sessions?id=${firstSessionId},${secondSessionId}`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.meta.source.numero_session === 'SE_0000109411'));
        assert.ok(response.body.sessions.find(s => s.meta.source.numero_session === 'SE_0000109412'));
    });

    it('can search though all sessions filtered by region', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109411', {
                session: { region: '11' }
            })),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109413', {
                session: { region: '24' }
            })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?region=11`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418|SE_0000109411'));
    });

    it('can search though all sessions filtered by numero', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109411', {
                session: { numero: 'SE_XXXXX1' }
            })),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109413', {
                session: { numero: 'SE_XXXXX3' }
            })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?numero=SE_XXXXX1`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418|SE_0000109411'));
    });

    it('can search though all sessions filtered by nb_avis', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109411', {
                session: {
                    score: {
                        nb_avis: 1,
                    },
                }
            })),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109413', {
                session: {
                    score: {
                        nb_avis: 0,
                    },
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/sessions?nb_avis=1`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418|SE_0000109411'));
    });

    it('can search though all sessions with pagination', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109411')),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_0000109412')),
        ]);

        let response = await request(app).get(`/api/v1/sessions?page=0&items_par_page=1`);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 1);

        response = await request(app).get(`/api/v1/sessions?page=1&items_par_page=1`);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 1);
        assert.deepEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 1,
            total_items: 2,
            total_pages: 2,
        });
    });

    it('can search though all sessions with projection', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_000010456')),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=score');
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 1);
        assert.deepEqual(Object.keys(response.body.sessions[0]), ['id', 'score']);
    });

    it('can search though all sessions with -projection', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newFormation()),
            insertIntoDatabase('sessionsReconciliees', buildNewSession('14_AF_0000010729|14_SE_0000109418|SE_000010456')),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=-avis');
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.sessions.length, 1);
        assert.deepEqual(Object.keys(response.body.sessions[0]), ['id', 'numero', 'region', 'score', 'meta']);
    });

}));
