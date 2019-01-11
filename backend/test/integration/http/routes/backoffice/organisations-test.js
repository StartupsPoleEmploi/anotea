const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newOrganismeAccount, randomize } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase, logAsFinancer, logAsOrganisme }) => {

    it('can get organisation by activation token', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            token,
            passwordHash: null,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .get(`/api/backoffice/organisation/getActivationAccountStatus?token=${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            raisonSociale: 'Pole Emploi Formation',
            siret: '11111111111111'
        });
    });

    it('can not get organisation with invalid token', async () => {

        let app = await startServer();

        let response = await request(app)
        .get(`/api/backoffice/organisation/getActivationAccountStatus?token=INVALID`);

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Numéro de token invalide'
        });
    });


    it('can activate account', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            token,
            passwordHash: null,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .post('/api/backoffice/organisation/activateAccount')
        .send({ token, password: 'Anotea2018!' });

        assert.equal(response.statusCode, 201);
        assert.deepEqual(response.body, {
            message: 'Account successfully created',
            userInfo: {
                username: '11111111111111',
                profile: 'organisme',
                id: 11111111111111
            }
        });

        //should flag account as rehashed
        let db = await getTestDatabase();
        let res = await db.collection('organismes').findOne({ _id: 11111111111111 });
        assert.ok(res.meta);
        assert.ok(res.meta.rehashed);
    });

    it('cannot activate account with invalid password', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('organismes', newOrganismeAccount({
            token,
            passwordHash: null,
        }));

        let response = await request(app)
        .post('/api/backoffice/organisation/activateAccount')
        .send({ token, password: 'INVALID' });

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Le mot de passe est invalide (il doit contenir au moins 6 caractères, une majuscule et un caractère spécial)'
        });
    });

    it('cannot activate account with invalid token', async () => {

        let app = await startServer();
        let response = await request(app)
        .post('/api/backoffice/organisation/activateAccount')
        .send({ token: 'INVALID' });

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Numéro de token invalide'
        });
    });

    it('can retrieve advices when authenticated as organisme', async () => {

        let app = await startServer();

        let id = 22222222222222;

        let token = await logAsOrganisme(app, 'edited@pole-emploi.fr', id);

        let response = await request(app).get(`/api/backoffice/organisation/${id}/allAdvices`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, { 
            'advices': [],
            'page': 1,
            'pageCount': 0
        });
    });

    it('can not retrieve advices when authenticated as financer', async () => {

        let app = await startServer();

        let id = 33333333333333;

        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: id,
            SIRET: id,
            editedCourriel: 'edited@pole-emploi.fr',
            meta: {
                siretAsString: `${id}`
            },
        }));

        let token = await logAsFinancer(app, 'financer@pole-emploi.fr', '2');

        let response = await request(app).get(`/api/backoffice/organisation/${id}/allAdvices`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, { error: true });
    });

    it('can not retrieve advices from an organisme when authenticated as another organisme', async () => {

        let app = await startServer();

        let id = 44444444444444;
        let courriel = 'edited@pole-emploi.fr';

        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: id,
            SIRET: id,
            courriel,
            meta: {
                siretAsString: `${id}`
            }
        }));

        let token = await logAsOrganisme(app, courriel, 55555555555555);

        let response = await request(app).get(`/api/backoffice/organisation/${id}/allAdvices`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 403);
        assert.deepEqual(response.body, {
            'error': 'Forbidden',
            'message': 'Action non autorisé',
            'statusCode': 403
        });
    });

}));
