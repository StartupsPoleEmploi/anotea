const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const ObjectID = require('mongodb').ObjectID;
const { newComment, randomize, newIntercarif, newFormation } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    it('can return session by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let commentId = new ObjectID();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({
                _id: '14_AF_0000010729',
                avis: [
                    newComment({
                        _id: commentId,
                        pseudo: pseudo,
                        formacode: '22252',
                        idSession: 'SE_0000109418',
                        training: {
                            idFormation: '14_AF_0000010729',
                            formacode: '22252',
                            organisation: {
                                siret: '82422814200108',
                            },
                            place: {
                                postalCode: '77420',
                            },
                            infoCarif: {
                                numeroAction: '14_SE_0000109418',
                                numeroSession: 'SE_0000109418'
                            },
                        }
                    }, date),
                ],
            }))
        ]);

        let response = await request(app).get(`/api/v1/formations/14_AF_0000010729`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            id: '14_AF_0000010729',
            numero: '14_AF_0000010729',
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
                    organisme_formateurs: ['11111111111111'],
                },
                source: {
                    numero_formation: '14_AF_0000010729',
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
                    numero: '14_AF_0000010729',
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
                            siret: '82422814200108',
                            numero: '14_OF_XXXXXXXXXX',
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

    it('should return formation with rejected avis', async () => {

        let app = await startServer();
        let date = new Date();
        let sessionId = '14_AF_0000010729|14_SE_0000109418|SE_0000109418';
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({
                _id: sessionId,
                numero: 'SE_0000109418',
                region: '11',
                avis: [
                    newComment({
                        rejected: true,
                        comment: {
                            title: 'WTF',
                            text: 'WTF',
                        },
                    }, date),
                ],
            }))
        ]);

        let response = await request(app).get(`/api/v1/formations/${sessionId}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.avis[0].commentaire, undefined);
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

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: '14_AF_0000010729' })),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: '14_AF_0000010730' })),
        ]);

        let response = await request(app).get('/api/v1/formations');

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 2);
        assert.ok(response.body.formations.find(s => s.numero === '14_AF_0000010729'));
        assert.ok(response.body.formations.find(s => s.numero === '14_AF_0000010730'));
    });

    it('can search though all formations filtered by ids', async () => {

        let app = await startServer();
        let firstSessionId = '14_AF_0000010729';
        let secondSessionId = '14_AF_0000010730';
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: firstSessionId })),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: secondSessionId })),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: '14_AF_0000010731' })),
        ]);

        let response = await request(app).get(`/api/v1/formations?id=${firstSessionId},${secondSessionId}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 2);
        assert.ok(response.body.formations.find(s => s.numero === '14_AF_0000010729'));
        assert.ok(response.body.formations.find(s => s.numero === '14_AF_0000010730'));
    });

    it('can search though all formations filtered by numero', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({
                _id: '14_AF_0000010729',
                numero: '14_AF_0000010729'
            })),
            insertIntoDatabase('formationsReconciliees', newFormation({
                _id: '14_AF_0000010730',
                numero: '14_AF_0000010730'
            })),
        ]);

        let response = await request(app).get(`/api/v1/formations?numero=14_AF_0000010729`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.ok(response.body.formations.find(s => s.id === '14_AF_0000010729'));
    });

    it('can search though all formations filtered by nb_avis', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({
                _id: '14_AF_0000010729',
                score: {
                    nb_avis: 1,
                },
            })),
            insertIntoDatabase('formationsReconciliees', newFormation({
                _id: '14_AF_0000010730',
                score: {
                    nb_avis: 0,
                },
            })),
        ]);

        let response = await request(app).get(`/api/v1/formations?nb_avis=1`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.ok(response.body.formations.find(s => s.id === '14_AF_0000010729'));
    });

    it('can search though all formations with pagination', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: '14_AF_0000010729' })),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: '14_AF_0000010730' })),
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

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: '14_AF_0000010729' })),
        ]);

        let response = await request(app).get('/api/v1/formations?fields=score');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.formations[0]), ['id', 'score']);
    });

    it('can search though all formations with projection (exclusion)', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('formationsReconciliees', newFormation({ _id: '14_AF_0000010729' })),
        ]);

        let response = await request(app).get('/api/v1/formations?fields=-avis');
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.formations.length, 1);
        assert.deepStrictEqual(Object.keys(response.body.formations[0]), ['id', 'numero', 'score', 'meta']);
    });

}));
