const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const ObjectID = require('mongodb').ObjectID;
const { newComment, randomize, newIntercarif } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, reconcile }) => {

    let reconcileActions = (intercarifs, avis = []) => {
        return Promise.all([
            ...intercarifs.map(data => insertIntoDatabase('intercarif', data)),
            ...avis.map(data => insertIntoDatabase('comment', data)),
        ])
        .then(() => reconcile({ actions: true }));
    };

    it('can return action by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let commentId = new ObjectID();

        await reconcileActions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
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

        let response = await request(app).get(`/api/v1/actions/F_XX_XX|AC_XX_XXXXXX`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: 'F_XX_XX|AC_XX_XXXXXX',
            region: '11',
            numero: 'AC_XX_XXXXXX',
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
                    numero: 'F_XX_XX',
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

    it('can return actions by id as application/ld+json', async () => {

        let app = await startServer();
        await reconcileActions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
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


        let response = await request(app)
        .get(`/api/v1/actions/F_XX_XX|AC_XX_XXXXXX`)
        .set('Accept', 'application/ld+json');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            '@context': 'http://schema.org',
            '@type': 'Course',
            'name': 'Développeur web',
            'courseCode': 'F_XX_XX',
            'provider': {
                '@type': 'Organization',
                'name': 'Centre de formation Anotéa',
            },
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': 2.4,
                'ratingCount': 1,
                'bestRating': 2.4,
                'worstRating': 2.4,
            }
        });
    });

    it('should return empty avis array when no avis can be found', async () => {

        let app = await startServer();
        await reconcileActions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '33333333333333',
                })
            ],
            [
                //no comments
            ]
        );

        let response = await request(app).get(`/api/v1/actions/F_XX_XX|AC_XX_XXXXXX`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('should fail when numero d\'action is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/actions/UNKNOWN`);

        assert.strictEqual(response.statusCode, 404);
        assert.deepStrictEqual(response.body, {
            error: 'Not Found',
            message: 'Numéro d\'action inconnu ou action expirée',
            statusCode: 404,
        });
    });

    it('can search trough all actions', async () => {

        let app = await startServer();

        await reconcileActions([
            newIntercarif({ numeroAction: 'AC_XX_XXXXX1' }),
            newIntercarif({ numeroAction: 'AC_XX_XXXXX2' }),
        ]);

        let response = await request(app).get('/api/v1/actions');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 2);
        assert.ok(response.body.actions.find(a => a.numero === 'AC_XX_XXXXX1'));
        assert.ok(response.body.actions.find(a => a.numero === 'AC_XX_XXXXX2'));
    });

    it('can search though all actions filtered by ids', async () => {

        let app = await startServer();
        await reconcileActions([
            newIntercarif({ numeroAction: 'AC_XX_XXXXX1' }),
            newIntercarif({ numeroAction: 'AC_XX_XXXXX2' }),
            newIntercarif({ numeroAction: 'AC_XX_XXXXX3' }),
        ]);

        let response = await request(app).get(`/api/v1/actions?id=F_XX_XX|AC_XX_XXXXX1,F_XX_XX|AC_XX_XXXXX2`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 2);
        assert.ok(response.body.actions.find(a => a.numero === 'AC_XX_XXXXX1'));
        assert.ok(response.body.actions.find(a => a.numero === 'AC_XX_XXXXX2'));
    });

    it('can search though all actions filtered by region', async () => {

        let app = await startServer();
        await reconcileActions([
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXX1', codeRegion: '11' }),
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXX2', codeRegion: '24' }),
        ]);

        let response = await request(app).get(`/api/v1/actions?region=11`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 1);
        assert.ok(response.body.actions.find(a => a.id === 'F_XX_XX|AC_XX_XXXXX1'));
    });

    it('can search though all actions filtered by numero', async () => {

        let app = await startServer();
        await reconcileActions([
            newIntercarif({ numeroAction: 'AC_XX_XXXXX1' }),
            newIntercarif({ numeroAction: 'AC_XX_XXXXX2' }),
        ]);

        let response = await request(app).get(`/api/v1/actions?numero=AC_XX_XXXXX1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 1);
        assert.ok(response.body.actions.find(a => a.numero === 'AC_XX_XXXXX1'));
    });

    it('can search though all actions filtered by nb_avis', async () => {

        let app = await startServer();
        await reconcileActions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXX1',
                    formacode: '22252',
                    organismeFormateur: '33333333333333',
                    lieuDeFormation: '75019',
                }),
                newIntercarif({ numeroAction: 'AC_XX_XXXXX2' }),
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
                })
            ]
        );

        let response = await request(app).get(`/api/v1/actions?nb_avis=1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 1);
        assert.ok(response.body.actions.find(a => a.id === 'F_XX_XX|AC_XX_XXXXX1'));
    });

    it('can search though all actions with pagination', async () => {

        let app = await startServer();
        await reconcileActions([
            newIntercarif({ numeroAction: 'AC_XX_XXXXX1' }),
            newIntercarif({ numeroAction: 'AC_XX_XXXXX2' }),
        ]);

        let response = await request(app).get(`/api/v1/actions?page=0&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 1);

        response = await request(app).get(`/api/v1/actions?page=1&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 1);
        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 1,
            total_items: 2,
            total_pages: 2,
        });
    });

    it('can search though all actions with projection', async () => {

        let app = await startServer();

        await reconcileActions([newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXX1' })]);

        let response = await request(app).get('/api/v1/actions?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.actions[0]), ['id', 'score']);

        response = await request(app).get('/api/v1/actions/F_XX_XX|AC_XX_XXXXX1?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'score']);
    });

    it('can search though all actions with -projection', async () => {

        let app = await startServer();

        await reconcileActions([newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXX1' })]);

        let response = await request(app).get('/api/v1/actions?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.actions.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.actions[0]), ['id', 'numero', 'region', 'score', 'meta']);

        response = await request(app).get('/api/v1/actions/F_XX_XX|AC_XX_XXXXX1?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'numero', 'region', 'score', 'meta']);
    });

    it('can get score with notes décimales', async () => {

        let app = await startServer();

        await reconcileActions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    formacode: '22252',
                    organismeFormateur: '33333333333333',
                    lieuDeFormation: '75019',
                }),
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

        let response = await request(app).get('/api/v1/actions?notes_decimales=true');
        assert.deepStrictEqual(response.body.actions[0].score.notes, {
            accompagnement: 1,
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            global: 2.4,
        });

        response = await request(app).get('/api/v1/actions/F_XX_XX|AC_XX_XXXXXX?notes_decimales=true');
        assert.deepStrictEqual(response.body.score.notes, {
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
        let commentId = new ObjectID();
        await reconcileActions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    formacode: '22252',
                    organismeFormateur: '33333333333333',
                    lieuDeFormation: '75019',
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

        let response = await request(app).get('/api/v1/actions/F_XX_XX|AC_XX_XXXXXX/avis');

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

    it('can return avis avec commentaires', async () => {

        let app = await startServer();
        let sansCommentaire = newComment({
            pseudo: 'pseudo',
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
        });
        delete sansCommentaire.comment;

        await reconcileActions(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    numeroAction: 'AC_XX_XXXXXX',
                    formacode: '22252',
                    organismeFormateur: '33333333333333',
                    lieuDeFormation: '75019',
                })
            ],
            [
                sansCommentaire,
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
                }),
            ]
        );

        let response = await request(app).get('/api/v1/actions/F_XX_XX|AC_XX_XXXXXX/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].pseudo, 'pseudo');
    });

}));
