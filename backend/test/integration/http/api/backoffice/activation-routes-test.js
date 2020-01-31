const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newOrganismeAccount, randomize } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase }) => {

    it('can get account by token', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            siret: '11111111111111',
            token,
            passwordHash: null,
        }));

        let response = await request(app)
        .get(`/api/backoffice/activation/${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            nom: 'Pole Emploi Formation',
            identifiant: '11111111111111',
            status: 'inactive',
        });
    });

    it('can get account already activated ', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            siret: '11111111111111',
            token,
            passwordHash: 12345,
        }));

        let response = await request(app)
        .get(`/api/backoffice/activation/${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.status, 'active');
    });

    it('can not get account with invalid token', async () => {

        let app = await startServer();

        let response = await request(app)
        .get(`/api/backoffice/activation/INVALID`);

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
            siret: '11111111111111',
            token,
            passwordHash: null,
        }));

        let response = await request(app)
        .post(`/api/backoffice/activation/${token}`)
        .send({ password: 'Anotea2018!' });

        assert.strictEqual(response.statusCode, 201);

        //should flag account as rehashed
        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ siret: '11111111111111' });
        assert.ok(res.meta);
        assert.ok(res.meta.rehashed);
    });

    it('can not activate account with invalid password', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            token,
            passwordHash: null,
        }));

        let response = await request(app)
        .post(`/api/backoffice/activation/${token}`)
        .send({ password: 'INVALID' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Le mot de passe est invalide (il doit contenir au moins 6 caractères, une majuscule et un caractère spécial)'
        });
    });

    it('can not activate account with invalid token', async () => {

        let app = await startServer();
        let response = await request(app)
        .post('/api/backoffice/activation/INVALID')
        .send({ password: 'A1234!' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Numéro de token invalide'
        });
    });
}));
