const request = require('supertest');
const moment = require('moment/moment');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../../helpers/with-server');
const { newAvis, randomize, randomSIRET } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    it('can search avis', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let oid = new ObjectID();

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                _id: oid,
                pseudo: pseudo
            }, date))
        ]);

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.pseudo === pseudo);
        assert.strictEqual(avis.length, 1);
        assert.deepStrictEqual(avis[0], {
            id: oid.toString(),
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
                    organisme_financeurs: [],
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
        let pseudo = randomize('pseudo');
        let date = new Date();
        let oid = new ObjectID();

        await insertIntoDatabase('avis', newAvis({
            _id: oid,
            pseudo: pseudo,
            comment: {
                text: 'Formation super géniale.',
            },
            meta: {
                original: {
                    comment: {
                        text: 'Cool',
                    }
                }
            }
        }, date));

        let response = await request(app).get(`/api/v1/avis/${oid.toString()}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: oid.toString(),
            pseudo,
            date: date.toJSON(),
            commentaire: {
                titre: 'Génial',
                texte: 'Formation super géniale.',
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
                    organisme_financeurs: [],
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
        let pseudo = randomize('pseudo');
        let date = new Date();
        let siret = randomSIRET();

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                pseudo: pseudo,
                training: {
                    organisation: {
                        siret,
                    },
                }
            }, date))
        ]);

        let response = await request(app).get(`/api/v1/avis?organisme_formateur=${siret}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('can search avis by lieu_de_formation', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let codePostal = '75000';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                pseudo,
                training: {
                    place: {
                        postalCode: codePostal,
                    },
                }
            }, date)),
        ]);

        let response = await request(app).get(`/api/v1/avis?lieu_de_formation=${codePostal}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('can search avis by certif_info', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let certifInfo = '12345';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                pseudo,
                training: {
                    certifInfos: [certifInfo],
                }
            }, date)),
        ]);

        let response = await request(app).get(`/api/v1/avis?certif_info=${certifInfo}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('can search avis by formacode', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let formacode = '11111';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                pseudo,
                training: {
                    formacodes: [formacode],
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/avis?formacode=${formacode}`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.pseudo === pseudo);
        assert.strictEqual(avis.length, 1);
        assert.deepStrictEqual(avis[0].formation.domaine_formation.formacodes[0], formacode);
    });

    it('can search avis with partial code', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let partialFormacode = '224';
        let formacode = '224123';

        await Promise.all([
            insertIntoDatabase('avis', newAvis()),
            insertIntoDatabase('avis', newAvis({
                pseudo,
                training: {
                    formacodes: [formacode],
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/avis?formacode=${partialFormacode}`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.pseudo === pseudo);
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

    it('should sort avis by date (desc)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ pseudo: '5minutesAgo' }, moment().subtract(5, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ pseudo: '6minutesAgo' }, moment().subtract(6, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ pseudo: '7minutesAgo' }, moment().subtract(7, 'minutes').toDate())),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=date');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '5minutesAgo');
        assert.strictEqual(response.body.avis[1].pseudo, '6minutesAgo');
        assert.strictEqual(response.body.avis[2].pseudo, '7minutesAgo');
    });

    it('should sort avis by date (asc)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ pseudo: '5minutesAgo' }, moment().subtract(5, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ pseudo: '6minutesAgo' }, moment().subtract(6, 'minutes').toDate())),
            insertIntoDatabase('avis', newAvis({ pseudo: '7minutesAgo' }, moment().subtract(7, 'minutes').toDate())),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=date&ordre=asc');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '7minutesAgo');
        assert.strictEqual(response.body.avis[1].pseudo, '6minutesAgo');
        assert.strictEqual(response.body.avis[2].pseudo, '5minutesAgo');
    });

    it('should sort avis by notes', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ pseudo: '1', rates: { global: 1 } })),
            insertIntoDatabase('avis', newAvis({ pseudo: '3', rates: { global: 3 } })),
            insertIntoDatabase('avis', newAvis({ pseudo: '2', rates: { global: 2 } })),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=notes');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, '3');
        assert.strictEqual(response.body.avis[1].pseudo, '2');
        assert.strictEqual(response.body.avis[2].pseudo, '1');
    });

    it('should sort avis by formation', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('avis', newAvis({ pseudo: 'C', training: { title: 'C' } })),
            insertIntoDatabase('avis', newAvis({ pseudo: 'A', training: { title: 'A' } })),
            insertIntoDatabase('avis', newAvis({ pseudo: 'B', training: { title: 'B' } })),
        ]);

        let response = await request(app).get('/api/v1/avis?tri=formation&ordre=asc');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, 'A');
        assert.strictEqual(response.body.avis[1].pseudo, 'B');
        assert.strictEqual(response.body.avis[2].pseudo, 'C');
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
        let pseudo = randomize('pseudo');
        let avis = newAvis({
            pseudo: pseudo,
        });
        delete avis.comment;
        await insertIntoDatabase('avis', avis);

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('should return avis with commentaire=null', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        await insertIntoDatabase('avis', newAvis({
            pseudo: pseudo,
            comment: null,
        }));

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('should not return avis not validated yet', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');

        await insertIntoDatabase('avis', newAvis({
            pseudo: pseudo,
            status: 'none',
        }));

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 0);
    });

    it('should return rejected avis (without pseudo and comment)', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');

        await insertIntoDatabase('avis', newAvis({
            _id: '12345',
            pseudo: pseudo,
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

    it.skip('should return avis with partial intitulé and same siret/code_postal', async () => {

        let app = await startServer();
        let intitule = 'fullstack';
        let siret = '12345678901234';
        let codePostal = '75000';

        await insertIntoDatabase('avis', newAvis({
            pseudo: 'test-user-intitule',
            training: {
                title: 'Développeur fullstack',
                organisation: {
                    siret: siret,
                },
                place: {
                    postalCode: codePostal,
                },
            }
        }));

        let response = await request(app).get(`/api/v1/organisme_formateurs/${siret}/lieu_de_formations/${codePostal}/formations/${intitule}/avis`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.pseudo === 'test-user-intitule');
        assert.strictEqual(avis.length, 1);
        assert.deepStrictEqual(avis[0].formation.intitule, 'Développeur fullstack');
        assert.deepStrictEqual(avis[0].formation.action.lieu_de_formation.code_postal, codePostal);
        assert.deepStrictEqual(avis[0].formation.action.organisme_formateur.siret, siret);
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
