const request = require('supertest');
const moment = require('moment');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const ObjectID = require('mongodb').ObjectID;
const { newAvis, newIntercarif } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, reconcile }) => {

    let insertAndReconcile = (intercarifs, avis = []) => {
        return Promise.all([
            ...intercarifs.map(data => insertIntoDatabase('intercarif', data)),
            ...avis.map(data => insertIntoDatabase('avis', data)),
        ])
        .then(() => reconcile({ formations: true }));
    };

    it('can return formation by id', async () => {

        let app = await startServer();
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
                    codeRegion: '11',
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                    notes: {
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
                    organisme_formateurs: ['33333333333333'],
                },
                source: {
                    numero_formation: 'F_XX_XX',
                    type: 'intercarif',
                }
            },
            avis: [{
                id: avisId.toString(),
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
                        organisme_financeurs: [
                            { code_financeur: '10' },
                        ],
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
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                    notes: {
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
        .get(`/api/v1/formations/F_XX_XX`)
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
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': 2.4,
                'ratingCount': 1,
                'bestRating': 5,
                'worstRating': 1,
            }
        });
    });

    it('should return formation with rejected avis', async () => {

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
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '82422814200108',
                            },
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

        let response = await request(app).get(`/api/v1/formations/F_XX_XX`);

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
            message: 'Numéro formation inconnu ou formation expirée',
            statusCode: 404,
        });
    });

    it('can search trough all formations', async () => {

        let app = await startServer();

        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
        ]);

        let response = await request(app).get('/api/v1/formations');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 2);
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X1'));
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X2'));
    });

    it('can search though all formations filtered by ids', async () => {

        let app = await startServer();
        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
            newIntercarif({ numeroFormation: 'F_XX_X3', numeroAction: 'AC_XX_XXXXX3', numeroSession: 'SE_XXXXX3' }),
        ]);

        let response = await request(app).get(`/api/v1/formations?id=F_XX_X1,F_XX_X2`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 2);
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X1'));
        assert.ok(response.body.formations.find(s => s.numero === 'F_XX_X2'));
    });

    it('can search though all formations filtered by numero', async () => {

        let app = await startServer();
        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
            newIntercarif({ numeroFormation: 'F_XX_X3', numeroAction: 'AC_XX_XXXXX3', numeroSession: 'SE_XXXXX3' }),
        ]);

        let response = await request(app).get(`/api/v1/formations?numero=F_XX_X1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.ok(response.body.formations.find(s => s.id === 'F_XX_X1'));
    });

    it('can search though all formations filtered by nb_avis', async () => {

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
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
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
        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
            newIntercarif({ numeroFormation: 'F_XX_X2', numeroAction: 'AC_XX_XXXXX2', numeroSession: 'SE_XXXXX2' }),
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

    it('can get formations with projection (inclusion)', async () => {

        let app = await startServer();

        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_XX', numeroAction: 'AC_XX_XXXXXX', numeroSession: 'SE_XXXXXX' }),
        ]);

        let response = await request(app).get('/api/v1/formations?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.formations[0]), ['id', 'score']);

        response = await request(app).get('/api/v1/formations/F_XX_XX?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'score']);
    });

    it('can search though all formations with projection (exclusion)', async () => {

        let app = await startServer();

        await insertAndReconcile([
            newIntercarif({ numeroFormation: 'F_XX_X1', numeroAction: 'AC_XX_XXXXX1', numeroSession: 'SE_XXXXX1' }),
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
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                    notes: {
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
        assert.deepStrictEqual(response.body.formations[0].score.notes, {
            accompagnement: 1,
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            global: 2.4,
        });

        response = await request(app).get('/api/v1/formations/F_XX_XX?notes_decimales=true');
        assert.deepStrictEqual(response.body.score.notes, {
            accompagnement: 1,
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            global: 2.4,
        });

        response = await request(app).get('/api/v1/formations/F_XX_XX/avis?notes_decimales=true');
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
                    codeRegion: '11',
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                    notes: {
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
                id: avisId.toString(),
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
                        organisme_financeurs: [
                            { code_financeur: '10' },
                        ],
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
        let oid = new ObjectID();

        let sansCommentaire = newAvis({
            _id: oid,
            codeRegion: '11',
            formation: {
                domaine_formation: {
                    formacodes: ['22252'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '75019',
                    },
                    organisme_formateur: {
                        siret: '33333333333333',
                    },
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
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/formations/F_XX_XX/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].id, oid.toString());
    });

    it('can return avis avec réponse', async () => {

        let app = await startServer();
        let oid = new ObjectID();

        let avisAvecReponse = newAvis({
            _id: oid,
            codeRegion: '11',
            formation: {
                domaine_formation: {
                    formacodes: ['22252'],
                },
                action: {
                    lieu_de_formation: {
                        code_postal: '75019',
                    },
                    organisme_formateur: {
                        siret: '33333333333333',
                    },
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
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/formations/F_XX_XX/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].id, oid.toString());
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
                    _id: '5minutesAgo',
                    codeRegion: '11',
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                            session: {
                                periode: {
                                    fin: moment().subtract(5, 'minutes').toDate(),
                                },
                            },
                        },
                    },
                }),
                newAvis({
                    _id: '7minutesAgo',
                    codeRegion: '11',
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                            session: {
                                periode: {
                                    fin: moment().subtract(7, 'minutes').toDate(),
                                },
                            },
                        },
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/formations/F_XX_XX/avis?tri=date&ordre=asc');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].id, '7minutesAgo');
        assert.strictEqual(response.body.avis[1].id, '5minutesAgo');
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
                    _id: '1',
                    codeRegion: '11',
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                    notes: {
                        global: 1
                    },
                }),
                newAvis({
                    _id: '2',
                    codeRegion: '11',
                    formation: {
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                    notes: {
                        global: 2,
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/formations/F_XX_XX/avis?tri=notes&ordre=desc');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].id, '2');
        assert.strictEqual(response.body.avis[1].id, '1');
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
                    _id: 'A',
                    codeRegion: '11',
                    formation: {
                        intitule: 'A',
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                }),
                newAvis({
                    _id: 'B',
                    codeRegion: '11',
                    formation: {
                        intitule: 'B',
                        domaine_formation: {
                            formacodes: ['22252'],
                        },
                        action: {
                            lieu_de_formation: {
                                code_postal: '75019',
                            },
                            organisme_formateur: {
                                siret: '33333333333333',
                            },
                        },
                    },
                    notes: {
                        global: 2,
                    },
                }),
            ]
        );

        let response = await request(app).get('/api/v1/formations/F_XX_XX/avis?tri=formation&ordre=desc');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].id, 'B');
        assert.strictEqual(response.body.avis[1].id, 'A');
    });

}));
