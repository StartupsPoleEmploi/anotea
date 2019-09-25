const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../../helpers/test-server');
const { newOrganismeAccount, randomize } = require('../../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase }) => {

    it('can get account by token', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            token,
            passwordHash: null,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .get(`/api/backoffice/account/${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            raisonSociale: 'Pole Emploi Formation',
            siret: '11111111111111',
            status: 'inactive',
        });
    });

    it('can get account aleady activated ', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            token,
            passwordHash: 12345,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .get(`/api/backoffice/account/${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.status, 'active');
    });

    it('can not get account with invalid token', async () => {

        let app = await startServer();

        let response = await request(app)
        .get(`/api/backoffice/account/INVALID`);

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Numéro de token invalide'
        });
    });


    it('can activate account', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            token,
            passwordHash: null,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .post('/api/backoffice/account/activate')
        .send({ token, password: 'Anotea2018!' });

        assert.strictEqual(response.statusCode, 201);
        assert.deepStrictEqual(response.body, {
            message: 'Account successfully created',
            userInfo: {
                username: '11111111111111',
                profile: 'organisme',
                id: 11111111111111
            }
        });

        //should flag account as rehashed
        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ _id: 11111111111111 });
        assert.ok(res.meta);
        assert.ok(res.meta.rehashed);
    });

    it('cannot activate account with invalid password', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            token,
            passwordHash: null,
        }));

        let response = await request(app)
        .post('/api/backoffice/account/activate')
        .send({ token, password: 'INVALID' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Le mot de passe est invalide (il doit contenir au moins 6 caractères, une majuscule et un caractère spécial)'
        });
    });

    it('cannot activate account with invalid token', async () => {

        let app = await startServer();
        let response = await request(app)
        .post('/api/backoffice/account/activate')
        .send({ token: 'INVALID' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Numéro de token invalide'
        });
    });


}));
