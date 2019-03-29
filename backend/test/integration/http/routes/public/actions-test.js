const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const ObjectID = require('mongodb').ObjectID;
const { newComment, randomize, newIntercarif, newAction } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase }) => {

    it('can return action by id', async () => {

        let app = await startServer();
        let pseudo = randomize('pseudo');
        let date = new Date();
        let actionId = '14_AF_0000010729|14_SE_0000109418';
        let commentId = new ObjectID();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({
                _id: actionId,
                numero: '14_SE_0000109418',
                region: '11',
                avis: [
                    newComment({
                        _id: commentId,
                        pseudo: pseudo,
                        formacode: '22252',
                        idSession: 'SE_XXXXXX',
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
                                numeroSession: 'SE_XXXXXX'
                            },
                        }
                    }, date)
                ],
            }))
        ]);

        let response = await request(app).get(`/api/v1/actions/${actionId}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            id: actionId,
            region: '11',
            numero: '14_SE_0000109418',
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
                    lieu_de_formation: '49000',
                    organisme_formateur: '11111111111111',
                },
                source: {
                    numero_formation: '14_AF_0000010729',
                    numero_action: '14_SE_0000109418',
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
                    numero: '14_AF_0000010729',
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

    it('should fail when numero d\'action is unknown', async () => {

        let app = await startServer();

        let response = await request(app).get(`/api/v1/actions/UNKNOWN`);

        assert.equal(response.statusCode, 404);
        assert.deepEqual(response.body, {
            error: 'Not Found',
            message: 'Numéro d\'action inconnu ou action expirée',
            statusCode: 404,
        });
    });

    it('can search trough all actions', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: '14_AF_0000010729|14_SE_0000109418' })),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: '14_AF_0000010729|14_SE_0000109417' })),
        ]);

        let response = await request(app).get('/api/v1/actions');

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 2);
        assert.ok(response.body.actions.find(s => s.numero === '14_SE_0000109418'));
        assert.ok(response.body.actions.find(s => s.numero === '14_SE_0000109417'));
    });

    it('can search though all actions filtered by ids', async () => {

        let app = await startServer();
        let firstActionId = '14_AF_0000010729|14_SE_0000109418';
        let secondActionId = '14_AF_0000010729|14_SE_0000109417';
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: firstActionId })),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: secondActionId })),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: '14_AF_0000010729|14_SE_0000109416' })),
        ]);

        let response = await request(app).get(`/api/v1/actions?id=${firstActionId},${secondActionId}`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 2);
        assert.ok(response.body.actions.find(s => s.numero === '14_SE_0000109418'));
        assert.ok(response.body.actions.find(s => s.numero === '14_SE_0000109417'));
    });

    it('can search though all sessions filtered by region', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({
                _id: '14_AF_0000010729|14_SE_0000109418',
                region: '11'
            })),
            insertIntoDatabase('actionsReconciliees', newAction({
                _id: '14_AF_0000010729|14_SE_0000109419',
                region: '24'
            })),
        ]);

        let response = await request(app).get(`/api/v1/actions?region=11`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 1);
        assert.ok(response.body.actions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418'));
    });

    it('can search though all sessions filtered by numero', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({
                _id: '14_AF_0000010729|14_SE_0000109418',
                numero: '14_SE_0000109418'
            })),
            insertIntoDatabase('actionsReconciliees', newAction({
                _id: '14_AF_0000010729|14_SE_0000109419',
                numero: '14_SE_0000109419'
            })),
        ]);

        let response = await request(app).get(`/api/v1/actions?numero=14_SE_0000109418`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 1);
        assert.ok(response.body.actions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418'));
    });

    it('can search though all sessions filtered by nb_avis', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({
                _id: '14_AF_0000010729|14_SE_0000109418',
                score: {
                    nb_avis: 1,
                }
            })),
            insertIntoDatabase('actionsReconciliees', newAction({
                _id: '14_AF_0000010729|14_SE_0000109419',
                score: {
                    nb_avis: 0,
                },
            })),
        ]);

        let response = await request(app).get(`/api/v1/actions?nb_avis=1`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 1);
        assert.ok(response.body.actions.find(s => s.id === '14_AF_0000010729|14_SE_0000109418'));
    });

    it('can search though all sessions with pagination', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: '14_AF_0000010729|14_SE_0000109418' })),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: '14_AF_0000010729|14_SE_0000109419' })),
        ]);

        let response = await request(app).get(`/api/v1/actions?page=0&items_par_page=1`);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 1);

        response = await request(app).get(`/api/v1/actions?page=1&items_par_page=1`);
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 1);
        assert.deepEqual(response.body.meta.pagination, {
            page: 1,
            items_par_page: 1,
            total_items: 2,
            total_pages: 2,
        });
    });

    it('can search though all sessions with projection', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: '14_AF_0000010729|14_SE_0000109418' })),
        ]);

        let response = await request(app).get('/api/v1/actions?fields=score');
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 1);
        assert.deepEqual(Object.keys(response.body.actions[0]), ['id', 'score']);
    });

    it('can search though all sessions with -projection', async () => {

        let app = await startServer();

        await Promise.all([
            insertIntoDatabase('intercarif', newIntercarif()),
            insertIntoDatabase('actionsReconciliees', newAction({ _id: '14_AF_0000010729|14_SE_0000109418' })),
        ]);

        let response = await request(app).get('/api/v1/actions?fields=-avis');
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.actions.length, 1);
        assert.deepEqual(Object.keys(response.body.actions[0]), ['id', 'numero', 'region', 'score', 'meta']);
    });

}));
