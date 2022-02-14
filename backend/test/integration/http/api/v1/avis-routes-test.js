const request = require('supertest');
const moment = require('moment/moment');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../helpers/with-server');
const { newAvis, randomSIRET } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    it('can search avis', async () => {

        let app = await startServer();
        let date = new Date();
        let oid = new ObjectID();

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                _id: oid,
            }, date))
        ]);

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.id === oid.toString());
        assert.strictEqual(avis.length, 1);
        assert.deepStrictEqual(avis[0], {
            id: oid.toString(),
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
                    formacodes: [
                        '46242'
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
                        code_postal: '75011',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [
                        { code_financeur: '10' },
                    ],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date.toJSON(),
                            fin: date.toJSON(),
                        }
                    }
                }
            }
        });

        assert.deepStrictEqual(response.body.meta, {
            pagination: {
                page: 0,
                items_par_page: 50,
                total_items: 2,
                total_pages: 1,
            }
        });
    });

    it('can get a single avis', async () => {

        let app = await startServer();
        let date = new Date();
        let oid = new ObjectID();

        await insertIntoDatabase('avis', newAvis({
            _id: oid,
            commentReport:'Commentaire chelou = mec chelou.',
            commentaire: {
                texte: 'Super formation.',
                titre: 'Génial'
            },
            meta: {
                original: {
                    commentaire: {
                        text: 'Cool',
                    }
                }
            }
        }, date));

        let response = await request(app).get(`/api/v1/avis/${oid.toString()}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: oid.toString(),
            date: date.toJSON(),
            commentaire: {
                texte: 'Super formation.',
                titre: 'Génial'
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
                    formacodes: [
                        '46242'
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
                        code_postal: '75011',
                        ville: 'Paris'
                    },
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        raison_sociale: 'INSTITUT DE FORMATION',
                        siret: '11111111111111',
                        numero: '14_OF_XXXXXXXXXX',
                    },
                    session: {
                        numero: 'SE_XXXXXX',
                        periode: {
                            debut: date.toJSON(),
                            fin: date.toJSON(),
                        }
                    }
                }
            }
        });
    });

    it('should fail when id is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/avis/${new ObjectID().toString()}`);

        assert.strictEqual(response.statusCode, 404);
        assert.deepStrictEqual(response.body, {
            error: 'Not Found',
            message: 'Identifiant inconnu',
            statusCode: 404,
        });
    });

    it('should fail when id is invalid', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/avis/UNKNOWN`);

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            error: 'Bad Request',
            message: 'Identifiant invalide',
            statusCode: 400,
        });
    });

    it('can search avis by organisme_formateur', async () => {

        let app = await startServer();
        let oid = new ObjectID();
        let date = new Date();
        let siret = randomSIRET();

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                _id: oid,
                formation: {
                    action: {
                        organisme_formateur: {
                            siret,
                        },
                    },
                },
            }, date))
        ]);

        let response = await request(app).get(`/api/v1/avis?organisme_formateur=${siret}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.id === oid.toString()).length, 1);
    });

    it('can search avis by lieu_de_formation', async () => {

        let app = await startServer();
        let oid = new ObjectID();
        let date = new Date();
        let codePostal = '75000';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                _id: oid,
                formation: {
                    action: {
                        lieu_de_formation: {
                            code_postal: codePostal,
                        },
                    },
                },
            }, date)),
        ]);

        let response = await request(app).get(`/api/v1/avis?lieu_de_formation=${codePostal}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.id === oid.toString()).length, 1);
    });

    it('can search avis by certif_info', async () => {

        let app = await startServer();
        let oid = new ObjectID();
        let date = new Date();
        let certifInfo = '12345';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                _id: oid,
                formation: {
                    certifications: [{ certif_info: certifInfo }],
                },
            }, date)),
        ]);

        let response = await request(app).get(`/api/v1/avis?certif_info=${certifInfo}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.id === oid.toString()).length, 1);
    });

    it('can search avis by formacode', async () => {

        let app = await startServer();
        let oid = new ObjectID();
        let formacode = '11111';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                _id: oid,
                formation: {
                    domaine_formation: {
                        formacodes: [formacode],
                    },
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/avis?formacode=${formacode}`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.id === oid.toString());
        assert.strictEqual(avis.length, 1);
        assert.deepStrictEqual(avis[0].formation.domaine_formation.formacodes[0], formacode);
    });

    it('can search avis with partial code', async () => {

        let app = await startServer();
        let oid = new ObjectID();
        let partialFormacode = '224';
        let formacode = '224123';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                _id: oid,
                formation: {
                    domaine_formation: {
                        formacodes: [formacode],
                    },
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/avis?formacode=${partialFormacode}`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.id === oid.toString());
        assert.strictEqual(avis.length, 1);
        assert.deepStrictEqual(avis[0].formation.domaine_formation.formacodes[0], formacode);
    });

    it('can search avis with pagination', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis()),
        ]);

        let response = await request(app).get('/api/v1/avis?page=0&items_par_page=2');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 2);

        response = await request(app).get('/api/v1/avis?page=1&items_par_page=2');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 2,
            total_items: 3,
            total_pages: 2,
        });
    });

    it('can get score with notes décimales', async () => {

        let app = await startServer();
        let avis = newAvis();

        await insertIntoDatabase('avis', avis);

        let response = await request(app).get('/api/v1/avis?notes_decimales=true');
        assert.deepStrictEqual(response.body.avis[0].notes, {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.4,
        });

        response = await request(app).get(`/api/v1/avis/${avis._id}?notes_decimales=true`);
        assert.deepStrictEqual(response.body.notes, {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.4,
        });
    });

    it('should return get reponse', async () => {

        let app = await startServer();
        await insertIntoDatabase('avis', newAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'validated',
            },
        }));

        let response = await request(app).get('/api/v1/avis');
        assert.deepStrictEqual(response.body.avis[0].reponse, {
            texte: 'Voici notre réponse',
        });
    });

    it('should ignore reponse', async () => {

        let app = await startServer();
        await insertIntoDatabase('avis', newAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'rejected',
            },
        }));

        let response = await request(app).get('/api/v1/avis');
        assert.ok(!response.body.avis[0].reponse);
    });

    it('should sort avis by date (desc)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ _id: '5minutesAgo' }, moment().subtract(5, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ _id: '6minutesAgo' }, moment().subtract(6, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ _id: '7minutesAgo' }, moment().subtract(7, 'minutes').toDate())),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=date');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].id, '5minutesAgo');
        assert.strictEqual(response.body.avis[1].id, '6minutesAgo');
        assert.strictEqual(response.body.avis[2].id, '7minutesAgo');
    });

    it('should sort avis by date (asc)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ _id: '5minutesAgo' }, moment().subtract(5, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ _id: '6minutesAgo' }, moment().subtract(6, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ _id: '7minutesAgo' }, moment().subtract(7, 'minutes').toDate())),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=date&ordre=asc');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].id, '7minutesAgo');
        assert.strictEqual(response.body.avis[1].id, '6minutesAgo');
        assert.strictEqual(response.body.avis[2].id, '5minutesAgo');
    });

    it('should sort avis by notes', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ _id: '1', notes: { global: 1 } })),
            insertIntoDatabase('avis', newAvis({ _id: '3', notes: { global: 3 } })),
            insertIntoDatabase('avis', newAvis({ _id: '2', notes: { global: 2 } })),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=notes');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].id, '3');
        assert.strictEqual(response.body.avis[1].id, '2');
        assert.strictEqual(response.body.avis[2].id, '1');
    });

    it('should sort avis by formation', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ _id: 'C', formation: { intitule: 'C' } })),
            insertIntoDatabase('avis', newAvis({ _id: 'A', formation: { intitule: 'A' } })),
            insertIntoDatabase('avis', newAvis({ _id: 'B', formation: { intitule: 'B' } })),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=formation&ordre=asc');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].id, 'A');
        assert.strictEqual(response.body.avis[1].id, 'B');
        assert.strictEqual(response.body.avis[2].id, 'C');
    });

    it('should return empty array when no avis can be found', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 0);
        assert.deepStrictEqual(response.body.meta, {
            pagination: {
                page: 0,
                items_par_page: 50,
                total_items: 0,
                total_pages: 0,
            }
        });
    });

    it('should return avis (notes)', async () => {

        let app = await startServer();
        let oid = new ObjectID();
        let avis = newAvis({
            _id: oid,
        });
        delete avis.commentaire;
        await insertIntoDatabase('avis', avis);

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.id === oid.toString()).length, 1);
    });

    it('should return avis with commentaire=null', async () => {

        let app = await startServer();
        let oid = new ObjectID();
        await insertIntoDatabase('avis', newAvis({
            _id: oid,
            commentaire: null,
        }));

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.id === oid.toString()).length, 1);
    });

    it('should not return avis not validated yet', async () => {

        let app = await startServer();
        let oid = new ObjectID();

        await insertIntoDatabase('avis', newAvis({
            _id: oid,
            status: 'none',
        }));

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.id === oid.toString()).length, 0);
    });

    it('should return rejected avis (without commentaire)', async () => {

        let app = await startServer();

        await insertIntoDatabase('avis', newAvis({
            _id: '12345',
            status: 'rejected',
        }));

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.find(a => a.id === '12345');
        assert.ok(avis);
        assert.deepStrictEqual(avis.commentaire, undefined);
    });

    it('should fail when parameters are invalid', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/avis?organisme_formateur=INVALID&lieu_de_formation=INVALID`);

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            error: 'Bad Request',
            statusCode: 400,
            message: 'Erreur de validation',
            details: [
                {
                    message: '"organisme_formateur" length must be at least 9 characters long',
                    path: [
                        'organisme_formateur'
                    ],
                    type: 'string.min',
                    context: {
                        limit: 9,
                        value: 'INVALID',
                        key: 'organisme_formateur',
                        label: 'organisme_formateur'
                    }
                },
                {
                    context: {
                        key: 'lieu_de_formation',
                        label: 'lieu_de_formation',
                        pattern: {},
                        value: 'INVALID',
                    },
                    message: '"lieu_de_formation" with value "INVALID" fails to match the required pattern: /^(([0-8][0-9])|(9[0-5])|(2[ab])|(97))[0-9]{3}$/',
                    path: [
                        'lieu_de_formation',
                    ],
                    type: 'string.regex.base',
                }
            ]
        });
    });

    it('can search avis and ignoring those archived', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ _id: '123', status: 'validated' })),
            insertIntoDatabase('avis', newAvis({ status: 'archived' }))
        ]);

        let response = await request(app)
        .get('/api/v1/avis');

        assert.strictEqual(response.statusCode, 200);
        assert.ok(response.body.avis);
        assert.deepStrictEqual(response.body.avis.length, 1);
        assert.deepStrictEqual(response.body.avis[0].id, '123');
    });
}));
