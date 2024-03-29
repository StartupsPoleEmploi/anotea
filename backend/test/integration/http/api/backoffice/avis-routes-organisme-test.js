const request = require('supertest');
const _ = require('lodash');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newAvis } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsOrganisme }) => {

    let buildAvis = (custom = {}) => {
        return newAvis(_.merge({}, {
            codeRegion: '11',
            formation: {
                action: {
                    organisme_financeurs: [{
                        code_financeur: '10',
                    }],
                    organisme_formateur: {
                        siret: '11111111111111',
                    },
                },
            },
        }, custom));
    };

    it(`can search avis with status (+default)`, async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111', { codeRegion: '11' }),
            insertIntoDatabase('avis', buildAvis({ status: 'validated' })),
            insertIntoDatabase('avis', buildAvis({ status: 'rejected' })),
            insertIntoDatabase('avis', buildAvis({ status: 'reported' })),
            insertIntoDatabase('avis', buildAvis({ status: 'none' })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.filter(a => ['validated', 'reported'].includes(a.status)).length, 2);

        response = await request(app)
        .get('/api/backoffice/avis?statuses=validated')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'validated');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=reported')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].status, 'reported');

        response = await request(app)
        .get('/api/backoffice/avis?statuses=none')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);

        response = await request(app)
        .get('/api/backoffice/avis?statuses=rejected')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);

        response = await request(app)
        .get('/api/backoffice/avis?statuses=archived')
        .set('authorization', `Bearer ${token}`);
        assert.strictEqual(response.statusCode, 400);
    });

    it('can search avis from other region', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111', { codeRegion: '11' }),
            insertIntoDatabase('avis', buildAvis({
                codeRegion: '94',
                formation: {
                    action: {
                        organisme_formateur: {
                            siret: '11111111111111',
                        },
                    },
                },
            })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
    });

    it('can search avis with siret', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111222222' } } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111111111' } } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=11111111111111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].formation.action.organisme_formateur.siret, '11111111111111');
    });
    
    it('can search avis organisme responsable with siret', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111122222' } } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111211111' } } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111111111' } } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=11111111111111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].formation.action.organisme_formateur.siret, '11111111111111');
    });

    it('can search avis with siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111122222' } } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '22222222222222' } } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=111111111')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].formation.action.organisme_formateur.siret, '11111111122222');
    });

    it('can not search avis with another siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111122222' } } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '22222222222222' } } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis?siren=22222222222222')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 400);
        assert.strictEqual(response.body.details[0].context.key, 'siren');
    });

    it('should automatically search avis with organisme siren', async () => {

        let app = await startServer();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'anotea.pe@gmail.com', '11111111111111'),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '11111111111111' } } } })),
            insertIntoDatabase('avis', buildAvis({ formation: { action: { organisme_formateur: { siret: '22222222222222' } } } })),
        ]);

        let response = await request(app)
        .get('/api/backoffice/avis')
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.avis.length, 1);
        assert.strictEqual(response.body.avis[0].formation.action.organisme_formateur.siret, '11111111111111');
    });

    it('can create a reponse', async () => {

        let app = await startServer();
        let avis = buildAvis();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '11111111111111'),
            insertIntoDatabase('avis', avis)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({ text: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 200);
        let reponse = response.body.reponse;
        assert.ok(reponse.date);
        assert.ok(reponse.lastStatusUpdate);
        assert.strictEqual(reponse.date, reponse.lastStatusUpdate);
        assert.deepStrictEqual(_.omit(reponse, ['date', 'lastStatusUpdate']), {
            text: 'Voici notre réponse',
            status: 'none',
        });
    });

    it('can not create a reponse with more than 300 characters', async () => {

        let app = await startServer();
        let avis = buildAvis();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '11111111111111'),
            insertIntoDatabase('avis', avis)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({
            text: 'Accusantium molestiae quasi enim facilis. Non deserunt autem ut sit est. Earum laudantium est amet soluta sed. ' +
                'Inventore eos nemo sunt sapiente atque ea repudiandae nam. Nihil nihil et consequatur nemo aut deserunt pariatur dolores. ' +
                'Accusantium molestiae quasi enim facilis. Accusantium molestiae quasi enim facilis.'
        });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            'statusCode': 400,
            'error': 'Bad Request',
            'message': 'Erreur de validation',
            'details': [
                {
                    'message': '"text" length must be less than or equal to 300 characters long',
                    'path': [
                        'text'
                    ],
                    'type': 'string.max',
                    'context': {
                        'limit': 300,
                        'value': 'Accusantium molestiae quasi enim facilis. Non deserunt autem ut sit est. Earum laudantium est amet soluta sed. ' +
                            'Inventore eos nemo sunt sapiente atque ea repudiandae nam. Nihil nihil et consequatur nemo aut deserunt pariatur dolores. ' +
                            'Accusantium molestiae quasi enim facilis. Accusantium molestiae quasi enim facilis.',
                        'key': 'text',
                        'label': 'text'
                    }
                }
            ]
        });
    });

    it('can create a reponse with same siren', async () => {

        let app = await startServer();
        let avis = buildAvis({
            formation: {
                action: {
                    organisme_formateur: {
                        siret: '11111111111111',
                    },
                },
            },
        });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '11111111122222'),
            insertIntoDatabase('avis', avis)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({ text: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 200);
    });

    it('can not create a reponse for another organisme', async () => {

        let app = await startServer();
        let avis = buildAvis();
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('avis', avis)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({ text: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 404);
    });

    it('can not create reponse with invalid avis id', async () => {

        let app = await startServer();
        let token = await logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222');

        let response = await request(app)
        .put(`/api/backoffice/avis/INVALID/addReponse`)
        .set('authorization', `Bearer ${token}`)
        .send({ reponse: 'Voici notre réponse' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Erreur de validation',
            details: [
                {
                    message: '"id" with value "INVALID" fails to match the Identifiant invalide pattern',
                    path: [
                        'id'
                    ],
                    type: 'string.regex.name',
                    context: {
                        name: 'Identifiant invalide',
                        pattern: {},
                        value: 'INVALID',
                        key: 'id',
                        label: 'id'
                    }
                }
            ]
        });
    });

    it('can remove a reponse', async () => {

        let app = await startServer();
        let avis = buildAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'validated',
            }
        });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '11111111111111'),
            insertIntoDatabase('avis', avis)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/removeReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.reponse, undefined);
    });

    it('can not remove a reponse of another organisme', async () => {

        let app = await startServer();
        let avis = buildAvis({
            reponse: {
                text: 'Voici notre réponse',
                status: 'validated',
            }
        });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('avis', avis)
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/removeReponse`)
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });


    it('can un/report avis', async () => {

        let app = await startServer();
        const avis = buildAvis({ read: false, qualification: 'positif' });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '11111111111111'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/report`)
        .send({ report: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.status, 'reported');
        assert.strictEqual(response.body.read, true);

        response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/report`)
        .send({ report: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.status, 'validated');
        assert.strictEqual(response.body.read, true);
        assert.strictEqual(response.body.qualification, undefined);
    });

    it('cannot report avis sans commentaire', async () => {

        let app = await startServer();
        const avis = buildAvis({ read: false, qualification: 'positif' });
        delete avis.commentaire;
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '11111111111111'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/report`)
        .send({ report: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can not un/report avis of another organisme', async () => {

        let app = await startServer();
        const avis = buildAvis({ read: false });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/report`)
        .send({ report: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

    it('can mark avis as read/unread', async () => {

        let app = await startServer();
        const avis = buildAvis({ read: false });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '11111111111111'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/read`)
        .send({ read: true })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.read, true);

        response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/read`)
        .send({ read: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.read, false);
    });

    it('can mark avis as read/unread of another organisme', async () => {

        let app = await startServer();
        const avis = buildAvis({ read: true });
        let [token] = await Promise.all([
            logAsOrganisme(app, 'organisme@pole-emploi.fr', '2222222222222'),
            insertIntoDatabase('avis', avis),
        ]);

        let response = await request(app)
        .put(`/api/backoffice/avis/${avis._id}/read`)
        .send({ read: false })
        .set('authorization', `Bearer ${token}`);

        assert.strictEqual(response.statusCode, 404);
    });

}));
