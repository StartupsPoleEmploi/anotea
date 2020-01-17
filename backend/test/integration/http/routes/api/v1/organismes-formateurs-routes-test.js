const request = require('supertest');
const assert = require('assert');
const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../../helpers/with-server');
const { newOrganismeAccount, newAvis, randomize } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    it('can return organisme by id', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newOrganismeAccount({
            siret: '22222222222222'
        }));

        let response = await request(app).get(`/api/v1/organismes-formateurs/22222222222222`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: 22222222222222,
            siret: '22222222222222',
            numero: '14_OF_0000000123',
            raison_sociale: 'Pole Emploi Formation',
            lieux_de_formation: [
                {
                    adresse: {
                        code_postal: '75019',
                        ville: 'Paris 19e',
                        region: '11'
                    }
                }
            ],
            score: {
                nb_avis: 15,
                notes: {
                    accueil: 5,
                    contenu_formation: 5,
                    equipe_formateurs: 4,
                    moyen_materiel: 3,
                    accompagnement: 4,
                    global: 5,
                },
                aggregation: {
                    global: {
                        max: 5.1,
                        min: 1,
                    },
                },
            }
        });
    });

    it('can return organisme by id as application/ld+json', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newOrganismeAccount({ siret: '22222222222222' }));

        let response = await request(app)
        .get(`/api/v1/organismes-formateurs/22222222222222`)
        .set('Accept', 'application/ld+json');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            '@context': 'http://schema.org',
            '@type': 'Organization',
            'name': 'Pole Emploi Formation',
            'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': 5.1,
                'ratingCount': 15,
                'bestRating': 5.1,
                'worstRating': 1,
            }
        });
    });

    it('should fail when id is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/organismes-formateurs/UNKNOWN`);

        assert.strictEqual(response.statusCode, 404);
        assert.deepStrictEqual(response.body, {
            error: 'Not Found',
            message: 'Identifiant inconnu',
            statusCode: 404,
        });
    });

    it('can search trough all organismes', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '11111111111111' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '22222222222222' })),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.organismes_formateurs.length, 2);
        assert.ok(response.body.organismes_formateurs.find(of => of.siret === '11111111111111'));
        assert.ok(response.body.organismes_formateurs.find(of => of.siret === '22222222222222'));
    });

    it('can search though all organismes filtered by sirets', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '11111111111111' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '22222222222222' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '33333333333333' })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?id=11111111111111,22222222222222`);

        assert.strictEqual(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.strictEqual(organismes.length, 2);
        assert.ok(organismes.find(s => s.id === 11111111111111));
        assert.ok(organismes.find(s => s.id === 22222222222222));
    });

    it('can search though all organismes filtered by numero', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({ _id: 11111111111111, numero: 'OF_XX1' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ _id: 22222222222222, numero: 'OF_XX2' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ _id: 33333333333333, numero: 'OF_XX3' })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?numero=OF_XX1,OF_XX2`);

        assert.strictEqual(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.strictEqual(organismes.length, 2);
        assert.ok(organismes.find(s => s.numero === 'OF_XX1'));
        assert.ok(organismes.find(s => s.numero === 'OF_XX2'));
    });

    it('can search though all organismes filtered by siret', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '11111111111111' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '22222222222222' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '33333333333333' })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?siret=11111111111111,22222222222222`);

        assert.strictEqual(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.strictEqual(organismes.length, 2);
        assert.ok(organismes.find(s => s.siret === '11111111111111'));
        assert.ok(organismes.find(s => s.siret === '22222222222222'));
    });

    it('can search though all organismes filtered by nb_avis', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                score: {
                    nb_avis: 1,
                }
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
                score: {
                    nb_avis: 0,
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?nb_avis=1`);

        assert.strictEqual(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.strictEqual(organismes.length, 1);
        assert.ok(organismes.find(s => s.siret === '11111111111111'));
        assert.ok(organismes.find(s => s.id === 11111111111111));
    });

    it('can search though all organismes filtered by lieu_de_formation (region)', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '75011',
                            ville: 'Paris 11e',
                            region: '11'
                        }
                    }
                ],
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '45000',
                            ville: 'Nantes',
                            region: '24'
                        }
                    }
                ],
            })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?lieu_de_formation=11`);

        assert.strictEqual(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.strictEqual(organismes.length, 1);
        assert.ok(organismes.find(s => s.siret === '11111111111111'));
    });


    it('can search though all organismes filtered by lieu_de_formation (code_postal)', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '75011',
                            ville: 'Paris 11e',
                            region: '11'
                        }
                    }
                ],
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '45000',
                            ville: 'Nantes',
                            region: '24'
                        }
                    }
                ],
            })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?lieu_de_formation=45000`);

        assert.strictEqual(response.statusCode, 200);
        let organismes = response.body.organismes_formateurs;
        assert.strictEqual(organismes.length, 1);
        assert.ok(organismes.find(s => s.id === 22222222222222));
    });

    it('can search though all organismes with pagination', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '11111111111111' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '22222222222222' })),
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '33333333333333' })),
        ]);

        let response = await request(app).get(`/api/v1/organismes-formateurs?page=0&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.organismes_formateurs.length, 1);

        response = await request(app).get(`/api/v1/organismes-formateurs?page=1&items_par_page=1`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.organismes_formateurs.length, 1);
        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 1,
            total_items: 3,
            total_pages: 3,
        });
    });

    it('can search though all organismes with projection (blacklist)', async () => {

        let app = await startServer();

        await insertIntoDatabase('accounts', newOrganismeAccount({ siret: '11111111111111' }));

        let response = await request(app).get('/api/v1/organismes-formateurs?fields=-lieux_de_formation');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.organismes_formateurs.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.organismes_formateurs[0]), ['id', 'raison_sociale', 'siret', 'numero', 'score']);

        response = await request(app).get('/api/v1/organismes-formateurs/11111111111111?fields=-lieux_de_formation');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'raison_sociale', 'siret', 'numero', 'score']);
    });

    it('can search though all organismes with projection (whitelist)', async () => {

        let app = await startServer();

        await insertIntoDatabase('accounts', newOrganismeAccount({ siret: '11111111111111' }));

        let response = await request(app).get('/api/v1/organismes-formateurs?fields=lieux_de_formation');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body.organismes_formateurs[0]), ['id', 'lieux_de_formation']);

        response = await request(app).get('/api/v1/organismes-formateurs/11111111111111?fields=lieux_de_formation');
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(Object.keys(response.body), ['id', 'lieux_de_formation']);
    });

    it('can get score with notes décimales', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({ siret: '11111111111111' })),
            insertIntoDatabase('avis', newAvis({
                training: {
                    organisation: {
                        siret: '11111111111111',
                    },
                },
                rates: {
                    accueil: 3,
                    contenu_formation: 2,
                    equipe_formateurs: 4,
                    moyen_materiel: 2,
                    accompagnement: 1,
                    global: 2.4,
                },
            })),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs?notes_decimales=true');
        assert.deepStrictEqual(response.body.organismes_formateurs[0].score, {
            nb_avis: 15,
            notes: {
                accueil: 5.1,
                contenu_formation: 5.1,
                equipe_formateurs: 4.1,
                moyen_materiel: 3.1,
                accompagnement: 4.1,
                global: 5.1,
            },
            aggregation: {
                global: {
                    max: 5.1,
                    min: 1,
                },
            },
        });

        response = await request(app).get('/api/v1/organismes-formateurs/11111111111111?notes_decimales=true');
        assert.deepStrictEqual(response.body.score, {
            nb_avis: 15,
            notes: {
                accueil: 5.1,
                contenu_formation: 5.1,
                equipe_formateurs: 4.1,
                moyen_materiel: 3.1,
                accompagnement: 4.1,
                global: 5.1,
            },
            aggregation: {
                global: {
                    max: 5.1,
                    min: 1,
                },
            },
        });

        response = await request(app).get('/api/v1/organismes-formateurs/11111111111111/avis?notes_decimales=true');
        assert.deepStrictEqual(response.body.avis[0].notes, {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.4,
        });
    });

    it('can return avis', async () => {

        let app = await startServer();
        let date = new Date();
        let avisId = new ObjectID();
        let pseudo = randomize('pseudo');
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', newAvis({
                _id: avisId,
                pseudo,
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
            }, date)),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs/22222222222222/avis');

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
                        formacodes: ['46242']
                    },
                    certifications: [{ certif_info: '78997' }],
                    action: {
                        numero: 'AC_XX_XXXXXX',
                        lieu_de_formation: {
                            code_postal: '75011',
                            ville: 'Paris'
                        },
                        organisme_financeurs: [],
                        organisme_formateur: {
                            raison_sociale: 'INSTITUT DE FORMATION',
                            siret: '22222222222222',
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
            training: {
                organisation: {
                    siret: '22222222222222',
                },
            },
        });
        delete sansCommentaire.commentaire;
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', sansCommentaire),
            insertIntoDatabase('avis', newAvis({
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
            })),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs/22222222222222/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].pseudo, 'pseudo');
    });

    it('can return avis avec commentaires', async () => {

        let app = await startServer();
        let avisAvecReponse = newAvis({
            pseudo: 'pseudo',
            training: {
                organisation: {
                    siret: '22222222222222',
                },
            },
            reponse: {
                text: 'La réponse',
                date: new Date(),
                status: 'none',
            },
        });
        delete avisAvecReponse.commentaire;
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', avisAvecReponse),
            insertIntoDatabase('avis', newAvis({
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
            })),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs/22222222222222/avis?commentaires=false');

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].pseudo, 'pseudo');
    });

    it('can search avis and ignoring those archived', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', newAvis({
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
            })),
            insertIntoDatabase('avis', newAvis({
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
                status: 'archived',
            })),
        ]);

        let response = await request(app)
        .get('/api/v1/organismes-formateurs/22222222222222/avis');

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 1);
    });

    it('should sort avis by date (desc)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: '5minutesAgo',
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
            }, moment().subtract(5, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({
                pseudo: '6minutesAgo',
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
            }, moment().subtract(6, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({
                pseudo: '7minutesAgo',
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                },
            }, moment().subtract(7, 'minutes').toDate())),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs/22222222222222/avis?tri=date');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '5minutesAgo');
        assert.strictEqual(response.body.avis[1].pseudo, '6minutesAgo');
        assert.strictEqual(response.body.avis[2].pseudo, '7minutesAgo');
    });

    it('should sort avis by date (asc)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: '5minutesAgo',
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            }, moment().subtract(5, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({
                pseudo: '6minutesAgo',
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            }, moment().subtract(6, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({
                pseudo: '7minutesAgo',
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            }, moment().subtract(7, 'minutes').toDate())),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs/22222222222222/avis?tri=date&ordre=asc');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '7minutesAgo');
        assert.strictEqual(response.body.avis[1].pseudo, '6minutesAgo');
        assert.strictEqual(response.body.avis[2].pseudo, '5minutesAgo');
    });

    it('should sort avis by notes', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: '1', rates: { global: 1 },
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: '3', rates: { global: 3 },
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: '2', rates: { global: 2 },
                training: {
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            })),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs/22222222222222/avis?tri=notes');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '3');
        assert.strictEqual(response.body.avis[1].pseudo, '2');
        assert.strictEqual(response.body.avis[2].pseudo, '1');
    });

    it('should sort avis by formation', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '22222222222222',
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: 'C', training: {
                    title: 'C',
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: 'A', training: {
                    title: 'A',
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            })),
            insertIntoDatabase('avis', newAvis({
                pseudo: 'B', training: {
                    title: 'B',
                    organisation: {
                        siret: '22222222222222',
                    },
                }
            })),
        ]);

        let response = await request(app).get('/api/v1/organismes-formateurs/22222222222222/avis?tri=formation&ordre=asc');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, 'A');
        assert.strictEqual(response.body.avis[1].pseudo, 'B');
        assert.strictEqual(response.body.avis[2].pseudo, 'C');
    });

}));
