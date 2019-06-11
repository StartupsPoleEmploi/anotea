const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const ObjectID = require('mongodb').ObjectID;
const { newComment, randomize, newIntercarif } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, reconcile }) => {

    let reconcileFormations = (intercarifs, avis = []) => {
        return Promise.all([
            ...intercarifs.map(data => insertIntoDatabase('intercarif', data)),
            ...avis.map(data => insertIntoDatabase('comment', data)),
        ])
        .then(() => reconcile({ formations: true }));
    };

    it('can return formation by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let commentId = new ObjectID();
        await reconcileFormations(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
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

        let response = await request(app).get('/api/v1/formations/F_XX_XX');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: 'F_XX_XX',
            numero: 'F_XX_XX',
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
                    organisme_formateurs: ['33333333333333'],
                },
                source: {
                    numero_formation: 'F_XX_XX',
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

    it('should return formation with rejected avis', async () => {

        let app = await startServer();
        let date = new Date();
        await reconcileFormations(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
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
                    rejected: true,
                    comment: {
                        title: 'WTF',
                        text: 'WTF',
                    },
                }, date)
            ]
        );

        let response = await request(app).get(`/api/v1/formations/F_XX_XX`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis[0].commentaire, undefined);
    });

    it('should return empty avis array when no avis can be found', async () => {

        let app = await startServer();
        await reconcileFormations(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
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

        let response = await request(app).get(`/api/v1/formations/F_XX_XX`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
    });

    it('should fail when numero de formation is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/formations/UNKNOWN`);

        assert.strictEqual(response.statusCode, 404);
        assert.deepStrictEqual(response.body, {
            error: 'Not Found',
            message: 'Numéro de formation inconnu ou formation expirée',
            statusCode: 404,
        });
    });

    it('can search trough all formations', async () => {

        let app = await startServer();

        await reconcileFormations([
            newIntercarif({ numeroFormation: 'F_XX_X1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2' }),
        ]);

        let response = await request(app).get('/api/v1/formations');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 2);
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X1'));
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X2'));
    });

    it('can search though all formations filtered by ids', async () => {

        let app = await startServer();
        await reconcileFormations([
            newIntercarif({ numeroFormation: 'F_XX_X1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2' }),
            newIntercarif({ numeroFormation: 'F_XX_X3' }),
        ]);

        let response = await request(app).get(`/api/v1/formations?id=F_XX_X1,F_XX_X2`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 2);
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X1'));
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X2'));
    });

    it('can search though all formations filtered by numero', async () => {

        let app = await startServer();
        await reconcileFormations([
            newIntercarif({ numeroFormation: 'F_XX_X1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2' }),
        ]);

        let response = await request(app).get(`/api/v1/formations?numero=F_XX_X1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.ok(response.body.formations.find(s => s.id === 'F_XX_X1'));
    });

    it('can search though all formations filtered by nb_avis', async () => {

        let app = await startServer();
        await reconcileFormations(
            [
                newIntercarif({ numeroFormation: 'F_XX_X2' }),
                newIntercarif({
                    numeroFormation: 'F_XX_X1',
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
                })
            ]
        );

        let response = await request(app).get(`/api/v1/formations?nb_avis=1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.ok(response.body.formations.find(s => s.id === 'F_XX_X1'));
    });

    it('can search though all formations with pagination', async () => {

        let app = await startServer();
        await reconcileFormations([
            newIntercarif({ numeroFormation: 'F_XX_X1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2' }),
        ]);


        let response = await request(app).get(`/api/v1/formations?page=0&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);

        response = await request(app).get(`/api/v1/formations?page=1&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 1,
            total_items: 2,
            total_pages: 2,
        });
    });

    it('should fail when items_per_page is too big', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/formations?page=0&items_par_page=5000`);

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

    it('can search though all formations with projection (inclusion)', async () => {

        let app = await startServer();

        await reconcileFormations([
            newIntercarif({ numeroFormation: 'F_XX_X1' }),
        ]);

        let response = await request(app).get('/api/v1/formations?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.formations[0]), ['id', 'score']);

        response = await request(app).get('/api/v1/formations/F_XX_X1?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'score']);
    });

    it('can search though all formations with projection (exclusion)', async () => {

        let app = await startServer();

        await reconcileFormations([
            newIntercarif({ numeroFormation: 'F_XX_X1' }),
        ]);


        let response = await request(app).get('/api/v1/formations?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.formations[0]), ['id', 'numero', 'score', 'meta']);

        response = await request(app).get('/api/v1/formations/F_XX_X1?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'numero', 'score', 'meta']);
    });

    it('can get score with notes décimales', async () => {

        let app = await startServer();

        await reconcileFormations(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_X1',
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

        let response = await request(app).get('/api/v1/formations?notes_decimales=true');
        assert.deepStrictEqual(response.body.formations[0].score, {
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

        response = await request(app).get('/api/v1/formations/F_XX_X1?notes_decimales=true');
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

    it('can return avis', async () => {

        let app = await startServer();
        let date = new Date();
        let pseudo = randomize('pseudo');
        let commentId = new ObjectID();
        await reconcileFormations(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
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

        let response = await request(app).get('/api/v1/formations/F_XX_XX/avis');

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

        await reconcileFormations(
            [
                newIntercarif({
                    numeroFormation: 'F_XX_XX',
                    formacode: '22252',
                    lieuDeFormation: '75019',
                    codeRegion: '11',
                    organismeFormateur: '33333333333333',
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

        let response = await request(app).get('/api/v1/formations/F_XX_XX/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].pseudo, 'pseudo');
    });

}));
