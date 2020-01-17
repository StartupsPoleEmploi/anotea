const request = require('supertest');
const moment = require('moment');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const ObjectID = require('mongodb').ObjectID;
const { newAvis, randomize, newIntercarif } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, reconcile }) => {

    let insertAndReconcile = (intercarifs, avis = []) => {
        return Promise.all([
            ...intercarifs.map(data => insertIntoDatabase('intercarif', data)),
            ...avis.map(data => insertIntoDatabase('avis', data)),
        ])
        .then(() => reconcile({ sessions: true }));
    };

    it('can return session by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let avisId = new ObjectID();
        await insertAndReconcile(
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
                newAvis({
                    _id: avisId,
                    pseudo: pseudo,
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
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
                },
                aggregation: {
                    global: {
                        max: 2.4,
                        min: 2.4,
                    }
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
                id: avisId.toString(),
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

    it('can return Course for application/ld+json', async () => {

        let app = await startServer();
        await insertAndReconcile(
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
                newAvis({
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
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


        let response = await request(app)
        .get(`/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX`)
        .set('Accept', 'application/ld+json');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            '@context': 'http://schema.org',
            '@type': 'Course',
            'name': 'Développeur web',
            'description': 'L\'objectif est d\'obtenir la qualification de développeur web, pour un accès à l\'emploi.',
            'courseCode': 'F_XX_XX',
            'provider': {
                '@type': 'Organization',
                'name': 'Centre de formation Anotéa',
            },
            'hasCourseInstance': [
                {
                    '@type': 'CourseInstance',
                    'courseMode': 'onsite',
                    'name': 'Développeur web',
                    'location': {
                        '@type': 'Place',
                        'name': 'Paris',
                        'address': {
                            '@type': 'PostalAddress',
                            'addressLocality': 'Paris',
                            'postalCode': '75019'
                        }
                    },
                    'organizer': {
                        '@type': 'Organization',
                        'name': 'Anotea Formation Paris'
                    },
                    'performer': {
                        '@type': 'Organization',
                        'name': 'Anotea Formation Paris',
                    },
                    'startDate': '2017-10-30T00:00:00.000Z',
                    'endDate': '2018-06-01T00:00:00.000Z',
                }
            ],
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': 2.4,
                'ratingCount': 1,
                'bestRating': 2.4,
                'worstRating': 2.4,
            }
        });
    });

    it('should return session with rejected avis', async () => {

        let app = await startServer();
        let date = new Date();
        await insertAndReconcile(
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
                newAvis({
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
                        organisation: {
                            siret: '82422814200108',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    status: 'rejected',
                    commentaire: {
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

    it('should return empty avis array when no avis can be found', async () => {

        let app = await startServer();
        await insertAndReconcile(
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
                //no comments
            ]
        );

        let response = await request(app).get(`/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('should fail when numero is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/sessions/UNKNOWN`);

        assert.strictEqual(response.statusCode, 404);
        assert.deepStrictEqual(response.body, {
            error: 'Not Found',
            message: 'Numéro session inconnu ou session expirée',
            statusCode: 404,
        });
    });

    it('can search trough all sessions', async () => {

        let app = await startServer();

        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
        ]);

        let response = await request(app).get('/api/v1/sessions');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX1'));
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX2'));
    });

    it('can search though all sessions filtered by ids', async () => {

        let app = await startServer();
        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
            newIntercarif({ numeroFormation: 'F_XX_X3', numeroAction: 'AC_XX_XXXXX3', numeroSession: 'SE_XXXXX3' }),
        ]);

        let response = await request(app).get(`/api/v1/sessions?id=F_XX_X1|AC_XX_XXXXX1|SE_XXXXX1,F_XX_X2|AC_XX_XXXXX2|SE_XXXXX2`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 2);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX1'));
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX2'));
    });

    it('can search though all sessions filtered by numero', async () => {

        let app = await startServer();
        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
            newIntercarif({ numeroFormation: 'F_XX_X3', numeroAction: 'AC_XX_XXXXX3', numeroSession: 'SE_XXXXX3' }),
        ]);

        let response = await request(app).get(`/api/v1/sessions?numero=SE_XXXXX1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.numero === 'SE_XXXXX1'));
    });

    it('can search though all sessions filtered by nb_avis', async () => {

        let app = await startServer();
        await insertAndReconcile(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_X1',
                    numeroAction: 'AC_XX_XXXXX1',
                    numeroSession: 'SE_XXXXX1',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '33333333333333',
                }),
                newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
            ],
            [
                newAvis({
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
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
        assert.ok(response.body.sessions.find(s => s.id === 'F_XX_X1|AC_XX_XXXXX1|SE_XXXXX1'));
    });

    it('can search though all sessions with pagination', async () => {

        let app = await startServer();
        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
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

    it('can get sessions with projection (inclusion)', async () => {

        let app = await startServer();

        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXXX', numeroSession: 'SE_XXXXXX' }),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.sessions[0]), ['id', 'score']);

        response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'score']);

    });

    it('can search though all sessions with projection (exclusion)', async () => {

        let app = await startServer();

        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
        ]);

        let response = await request(app).get('/api/v1/sessions?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.sessions[0]), ['id', 'numero', 'region', 'score', 'meta']);

        response = await request(app).get('/api/v1/sessions/F_XX_X1|AC_XX_XXXXX1|SE_XXXXX1?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'numero', 'region', 'score', 'meta']);
    });

    it('can get score with notes décimales', async () => {

        let app = await startServer();

        await insertAndReconcile(
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
                newAvis({
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
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
        assert.deepStrictEqual(response.body.sessions[0].score.notes, {
            accompagnement: 1,
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            global: 2.4,
        });

        response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX?notes_decimales=true');
        assert.deepStrictEqual(response.body.score.notes, {
            accompagnement: 1,
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            global: 2.4,
        });

        response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX/avis?notes_decimales=true');
        assert.deepStrictEqual(response.body.avis[0].notes, {
            accompagnement: 1,
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            global: 2.4,
        });
    });

    it('can return avis', async () => {

        let app = await startServer();
        let date = new Date();
        let pseudo = randomize('pseudo');
        let avisId = new ObjectID();
        await insertAndReconcile(
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
                newAvis({
                    _id: avisId,
                    pseudo,
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
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

        let response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX/avis');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            avis: [{
                id: avisId.toString(),
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

    it('can return avis avec commentaires', async () => {

        let app = await startServer();
        let sansCommentaire = newAvis({
            pseudo: 'pseudo',
            codeRegion: '11',
            training: {
                formacodes: ['22252'],
                organisation: {
                    siret: '33333333333333',
                },
                place: {
                    postalCode: '75019',
                },
            },
        });
        delete sansCommentaire.commentaire;

        await insertAndReconcile(
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
                sansCommentaire,
                newAvis({
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].pseudo, 'pseudo');
    });

    it('can return avis avec réponse', async () => {

        let app = await startServer();
        let avisAvecReponse = newAvis({
            pseudo: 'pseudo',
            codeRegion: '11',
            training: {
                formacodes: ['22252'],
                organisation: {
                    siret: '33333333333333',
                },
                place: {
                    postalCode: '75019',
                },
            },
            reponse: {
                text: 'La réponse',
                date: new Date(),
                status: 'none',
            },
        });
        delete avisAvecReponse.commentaire;

        await insertAndReconcile(
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
                avisAvecReponse,
                newAvis({
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].pseudo, 'pseudo');
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

    it('can return avis sorted by date', async () => {

        let app = await startServer();
        await insertAndReconcile(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX',
                    formacode: '22252',
                    organismeFormateur: '33333333333333',
                    lieuDeFormation: '75019',
                })
            ],
            [
                newAvis({
                    pseudo: '5minutesAgo',
                    codeRegion: '11',
                    training: {
                        scheduledEndDate: moment().subtract(5, 'minutes').toDate(),
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                }),
                newAvis({
                    pseudo: '7minutesAgo',
                    codeRegion: '11',
                    training: {
                        scheduledEndDate: moment().subtract(7, 'minutes').toDate(),
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX/avis?tri=date&ordre=asc');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '7minutesAgo');
        assert.strictEqual(response.body.avis[1].pseudo, '5minutesAgo');
    });

    it('can return avis sorted by notes', async () => {

        let app = await startServer();
        await insertAndReconcile(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX',
                    formacode: '22252',
                    organismeFormateur: '33333333333333',
                    lieuDeFormation: '75019',
                })
            ],
            [
                newAvis({
                    pseudo: '1',
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    rates: {
                        global: 1
                    },
                }),
                newAvis({
                    pseudo: '2',
                    codeRegion: '11',
                    training: {
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    rates: {
                        global: 2,
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX/avis?tri=notes&ordre=desc');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '2');
        assert.strictEqual(response.body.avis[1].pseudo, '1');
    });

    it('can return avis sorted by formation', async () => {

        let app = await startServer();
        await insertAndReconcile(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    numeroSession: 'SE_XXXXXX',
                    formacode: '22252',
                    organismeFormateur: '33333333333333',
                    lieuDeFormation: '75019',
                })
            ],
            [
                newAvis({
                    pseudo: 'A',
                    codeRegion: '11',
                    training: {
                        title: 'A',
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                }),
                newAvis({
                    pseudo: 'B',
                    codeRegion: '11',
                    training: {
                        title: 'B',
                        formacodes: ['22252'],
                        organisation: {
                            siret: '33333333333333',
                        },
                        place: {
                            postalCode: '75019',
                        },
                    },
                    rates: {
                        global: 2,
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/sessions/F_XX_XX|AC_XX_XXXXXX|SE_XXXXXX/avis?tri=formation&ordre=desc');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, 'B');
        assert.strictEqual(response.body.avis[1].pseudo, 'A');
    });

    it('can search though all sessions filtered by region', async () => {

        let app = await startServer();
        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1', codeRegion: '11' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2', codeRegion: '24' }),
        ]);

        let response = await request(app).get(`/api/v1/sessions?region=11`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.sessions.length, 1);
        assert.ok(response.body.sessions.find(s => s.id === 'F_XX_X1|AC_XX_XXXXX1|SE_XXXXX1'));
    });


}));
