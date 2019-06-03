const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const ObjectID = require('mongodb').ObjectID;
const { newComment, randomize, newIntercarif } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, reconcile }) => {

    let reconcileSessions = (intercarifs, avis = []) => {
        return Promise.all([
            ...intercarifs.map(data => insertIntoDatabase('intercarif', data)),
            ...avis.map(data => insertIntoDatabase('comment', data)),
        ])
        .then(() => reconcile({ sessions: true }));
    };

    it('can return session by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let commentId = new ObjectID();
        await reconcileSessions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '33333333333333',
                })
            ],
            [
                newComment({
                    _id: commentId,
                    pseudo: pseudo,
                    codeRegion: '11',
                    formacode: '22252',
                    training: {
                        formacode: '22252',
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    rates: {
                        accompagnement: 1,
                        accueil: 3,
                        contenu_formation: 2,
                        equipe_formateurs: 4,
                        moyen_materiel: 2,
                        global: 2.4,
                    },
                }, date)
            ]
        );

        let response = await request(app).get(`/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX',
            region: '11',
            numero: 'SE_XXXXXX',
            score: {
                nb_avis: 1,
                notes: {
                    accompagnement: 1,
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    global: 2,
                }
            },
            meta: {
                reconciliation: {
                    certifinfos: ['80735'],
                    formacodes: ['22252'],
                    lieu_de_formation: '75019',
                    organisme_formateur: '33333333333333',
                },
                source: {
                    numero_formation: 'F_XX_XX',
                    numero_action: 'AC_XX_XXXXXX',
                    numero_session: 'SE_XXXXXX',
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
                    numero: 'F_XX_XX',
                    intitule: 'Développeur',
                    domaine_formation: {
                        formacodes: ['22252']
                    },
                    certifications: [{ certif_info: '78997' }],
                    action: {
                        numero: 'AC_XX_XXXXXX',
                        lieu_de_formation: {
                            code_postal: '75019',
                            ville: 'Paris'
                        },
                        organisme_financeurs: [],
                        organisme_formateur: {
                            raison_sociale: 'INSTITUT DE FORMATION',
                            siret: '33333333333333',
                            numero: '14_OF_XXXXXXXXXX',
                        },
                        session: {
                            numero: 'SE_XXXXXX',
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
        await reconcileSessions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '82422814200108',
                })
            ],
            [
                newComment({
                    codeRegion: '11',
                    formacode: '22252',
                    training: {
                        formacode: '22252',
                        organisation: {
                            siret: '82422814200108',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    rejected: true,
                    comment: {
                        title: 'WTF',
                        text: 'WTF',
                    },
                }, date)
            ]
        );

        let response = await request(app).get(`/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX`);

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

        await reconcileSessions([
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXXX', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXXX', numeroSession: 'SE_XXXXX2' }),
        ]);

        let response = await request(app).get('/api/v1/sessions');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX1'));
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX2'));
    });

    it('can search though all sessions filtered by ids', async () => {

        let app = await startServer();
        await reconcileSessions([
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXXX', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXXX', numeroSession: 'SE_XXXXX2' }),
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXXX', numeroSession: 'SE_XXXXX3' }),
        ]);

        let response = await request(app)
        .get(`/api/v1/sessions?id=F_XX_XX|AC_XX_XXXXXX|SE_XXXXX1,F_XX_XX|AC_XX_XXXXXX|SE_XXXXX2`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX1'));
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX2'));
    });

    it('can search though all sessions filtered by region', async () => {

        let app = await startServer();
        await reconcileSessions([
            newIntercarif({ numeroSession: 'SE_XXXXX1', codeRegion: '11' }),
            newIntercarif({ numeroSession: 'SE_XXXXX2', codeRegion: '24' }),
        ]);

        let response = await request(app).get(`/api/v1/sessions?region=11`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXX1'));
    });

    it('can search though all sessions filtered by numero', async () => {

        let app = await startServer();
        await reconcileSessions([
            newIntercarif({ numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroSession: 'SE_XXXXX2' }),
            newIntercarif({ numeroSession: 'SE_XXXXX3' }),
        ]);

        let response = await request(app).get(`/api/v1/sessions?numero=SE_XXXXX1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX1'));
    });

    it('can search though all sessions filtered by nb_avis', async () => {

        let app = await startServer();
        await reconcileSessions(
            [
                newIntercarif({ numeroSession: 'SE_XXXXX2' }),
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXX1',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '82422814200108',
                })
            ],
            [
                newComment({
                    codeRegion: '11',
                    formacode: '22252',
                    training: {
                        formacode: '22252',
                        organisation: {
                            siret: '82422814200108',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                })
            ]
        );

        let response = await request(app).get(`/api/v1/sessions?nb_avis=1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === 'F_XX_XX|AC_XX_XXXXXX|SE_XXXXX1'));
    });

    it('can search though all sessions with pagination', async () => {

        let app = await startServer();
        await reconcileSessions([
            newIntercarif({ numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroSession: 'SE_XXXXX2' }),
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

        await reconcileSessions([
            newIntercarif({ numeroSession: 'SE_XXXXX1' }),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.sessions[0]), ['id', 'score']);
    });

    it('can search though all sessions with projection (exclusion)', async () => {

        let app = await startServer();

        await reconcileSessions([
            newIntercarif({ numeroSession: 'SE_XXXXX1' }),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.sessions[0]), ['id', 'numero', 'region', 'score', 'meta']);
    });

    it('can get score with notes décimales', async () => {

        let app = await startServer();

        await reconcileSessions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXX1',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '33333333333333',
                })
            ],
            [
                newComment({
                    codeRegion: '11',
                    formacode: '22252',
                    training: {
                        formacode: '22252',
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    rates: {
                        accompagnement: 1,
                        accueil: 3,
                        contenu_formation: 2,
                        equipe_formateurs: 4,
                        moyen_materiel: 2,
                        global: 2.4,
                    },
                })
            ]
        );

        let response = await request(app).get('/api/v1/sessions?notes_decimales=true');
        assert.deepStrictEqual(response.body.sessions[0].score, {
            nb_avis: 1,
            notes: {
                accompagnement: 1,
                accueil: 3,
                contenu_formation: 2,
                equipe_formateurs: 4,
                moyen_materiel: 2,
                global: 2.4,
            }
        });

        response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXX1?notes_decimales=true');
        assert.deepStrictEqual(response.body.score, {
            nb_avis: 1,
            notes: {
                accompagnement: 1,
                accueil: 3,
                contenu_formation: 2,
                equipe_formateurs: 4,
                moyen_materiel: 2,
                global: 2.4,
            }
        });
    });

    it('can return avis for a session', async () => {

        let app = await startServer();
        let date = new Date();
        let pseudo = randomize('pseudo');
        let commentId = new ObjectID();
        await reconcileSessions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXX1',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '33333333333333',
                })
            ],
            [
                newComment({
                    _id: commentId,
                    pseudo,
                    codeRegion: '11',
                    formacode: '22252',
                    training: {
                        formacode: '22252',
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    rates: {
                        accompagnement: 1,
                        accueil: 3,
                        contenu_formation: 2,
                        equipe_formateurs: 4,
                        moyen_materiel: 2,
                        global: 2,
                    },
                }, date),
            ]
        );

        let response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXX1/avis');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
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
                    numero: 'F_XX_XX',
                    intitule: 'Développeur',
                    domaine_formation: {
                        formacodes: ['22252']
                    },
                    certifications: [{ certif_info: '78997' }],
                    action: {
                        numero: 'AC_XX_XXXXXX',
                        lieu_de_formation: {
                            code_postal: '75019',
                            ville: 'Paris'
                        },
                        organisme_financeurs: [],
                        organisme_formateur: {
                            raison_sociale: 'INSTITUT DE FORMATION',
                            siret: '33333333333333',
                            numero: '14_OF_XXXXXXXXXX',
                        },
                        session: {
                            numero: 'SE_XXXXXX',
                            periode: {
                                debut: date.toJSON(),
                                fin: date.toJSON()
                            }
                        }
                    }
                }
            }],
            meta: {
                pagination: {
                    page: 0,
                    items_par_page: 50,
                    total_items: 1,
                    total_pages: 1,
                }
            }
        });
    });
}));
