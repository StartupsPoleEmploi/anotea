const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../helpers/test-server');
const { newOrganismeAccount, randomize } = require('../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase, logAsModerateur }) => {

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

    it('can edit email', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let id = 11111111111111;

        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: id,
            SIRET: id,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .post(`/api/backoffice/organisation/${id}/editedEmail`)
        .set('authorization', `Bearer ${token}`)
        .send({ email: 'edited@pole-emploi.fr' });

        assert.equal(response.statusCode, 201);
        assert.deepEqual(response.body, { 'status': 'OK' });

        let db = await getTestDatabase();
        let res = await db.collection('organismes').findOne({ _id: id });
        assert.deepEqual(res.editedEmail, 'edited@pole-emploi.fr');
    });

    it('can delete an edited email', async () => {

        let app = await startServer();
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');
        let id = 11111111111111;

        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: id,
            SIRET: id,
            editedEmail: 'edited@pole-emploi.fr',
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .delete(`/api/backoffice/organisation/${id}/editedEmail`)
        .set('authorization', `Bearer ${token}`);

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, { 'status': 'OK' });

        let db = await getTestDatabase();
        let res = await db.collection('organismes').findOne({ _id: id });
        assert.ok(!res.editedEmail);
    });
}));
