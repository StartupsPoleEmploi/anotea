const request = require('supertest');
const moment = require('moment');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { withServer } = require('../../../../helpers/test-server');
const { newComment, randomize, randomSIRET } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    it('can search avis', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let oid = new ObjectID();

        await Promise.all([
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
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
                numero: '14_AF_0000011111',
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
                    numero: '14_SE_0000092458',
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
                        numero: '2422722',
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

        await insertIntoDatabase('comment', newComment({
            _id: oid,
            pseudo: pseudo,
            editedComment: {
                text: 'Formation super géniale.',
                date: new Date(),
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
                numero: '14_AF_0000011111',
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
                    numero: '14_SE_0000092458',
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
                        numero: '2422722',
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
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
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
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
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
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
                pseudo,
                training: {
                    certifInfo: {
                        id: certifInfo,
                    },
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
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
                pseudo,
                formacode: formacode,
                training: {
                    formacode: formacode,
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
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment({
                pseudo,
                formacode: formacode,
                training: {
                    formacode: formacode,
                }
            })),
        ]);

        let response = await request(app).get(`/api/v1/avis?formacode=${partialFormacode}`);

        assert.strictEqual(response.statusCode, 200);
        let avis = response.body.avis.filter(a => a.pseudo === pseudo);
        assert.strictEqual(avis.length, 1);
        assert.deepStrictEqual(avis[0].formation.domaine_formation.formacodes[0], formacode);
    });

    it('can search avis with commentaires', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');

        let noCommentaire = newComment();
        delete noCommentaire.comment;

        await Promise.all([
            insertIntoDatabase('comment', noCommentaire),
            insertIntoDatabase('comment', newComment({
                pseudo: pseudo,
            }))
        ]);

        let response = await request(app).get(`/api/v1/avis?avec_commentaires_uniquement=true`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('can search avis with pagination', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment()),
            insertIntoDatabase('comment', newComment()),
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
        let comment = newComment();

        await insertIntoDatabase('comment', comment);

        let response = await request(app).get('/api/v1/avis?notes_decimales=true');
        assert.deepStrictEqual(response.body.avis[0].notes, {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.4,
        });

        response = await request(app).get(`/api/v1/avis/${comment._id}?notes_decimales=true`);
        assert.deepStrictEqual(response.body.notes, {
            accueil: 3,
            contenu_formation: 2,
            equipe_formateurs: 4,
            moyen_materiel: 2,
            accompagnement: 1,
            global: 2.4,
        });
    });

    it('should sort avis by date', async () => {

        let app = await startServer();
        let pseudo1 = randomize('pseudo');
        let pseudo2 = randomize('pseudo');
        let pseudo3 = randomize('pseudo');

        await Promise.all([
            insertIntoDatabase('comment', newComment({ pseudo: pseudo1 }, moment().subtract(5, 'minutes').toDate())),
            insertIntoDatabase('comment', newComment({ pseudo: pseudo2 }, moment().subtract(6, 'minutes').toDate())),
            insertIntoDatabase('comment', newComment({ pseudo: pseudo3 }, moment().subtract(7, 'minutes').toDate())),
        ]);

        let response = await request(app).get('/api/v1/avis');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis[0].pseudo, pseudo1);
        assert.strictEqual(response.body.avis[1].pseudo, pseudo2);
        assert.strictEqual(response.body.avis[2].pseudo, pseudo3);
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

    it('should return avis without commentaire', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let comment = newComment({
            pseudo: pseudo,
            moderated: false,
        });
        delete comment.comment;
        await insertIntoDatabase('comment', comment);

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('should return avis with commentaire=null', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        await insertIntoDatabase('comment', newComment({
            pseudo: pseudo,
            comment: null,
        }));

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 1);
    });

    it('should not return avis not published yet', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');

        await insertIntoDatabase('comment', newComment({
            pseudo: pseudo,
            published: false,
        }));

        let response = await request(app).get(`/api/v1/avis`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => a.pseudo === pseudo).length, 0);
    });

    it('should return rejected avis (without pseudo and comment)', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');

        await insertIntoDatabase('comment', newComment({
            _id: '12345',
            pseudo: pseudo,
            published: false,
            rejected: true,
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

        await insertIntoDatabase('comment', newComment({
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
}));
