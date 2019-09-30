const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newOrganismeAccount, newModerateurAccount, randomize } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase, logAsModerateur }) => {

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
        .get(`/api/backoffice/accounts/${token}`);

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
            _id: 11111111111111,
            SIRET: 11111111111111,
            token,
            passwordHash: 12345,
            meta: {
                siretAsString: '11111111111111'
            },
        }));

        let response = await request(app)
        .get(`/api/backoffice/accounts/${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.status, 'active');
    });

    it('can not get account with invalid token', async () => {

        let app = await startServer();

        let response = await request(app)
        .get(`/api/backoffice/accounts/INVALID`);

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
        .post(`/api/backoffice/accounts/${token}/activate`)
        .send({ password: 'Anotea2018!' });

        assert.strictEqual(response.statusCode, 201);

        //should flag account as rehashed
        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ _id: 11111111111111 });
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
        .post(`/api/backoffice/accounts/${token}/activate`)
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
        .post('/api/backoffice/accounts/INVALID/activate')
        .send({ password: 'A1234!' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Numéro de token invalide'
        });
    });

    it('can update password', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount({ courriel: 'admin@pole-emploi.fr' }));
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .put(`/api/backoffice/accounts/me/updatePassword`)
        .set('authorization', `Bearer ${token}`)
        .send({
            current: 'password',
            password: 'A1234!',
        });
        assert.strictEqual(response.statusCode, 200);

        //can login with new password
        response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'admin@pole-emploi.fr', password: 'A1234!' });
        assert.strictEqual(response.statusCode, 200);
    });

    it('can not update password with invalid current password', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount({ courriel: 'admin@pole-emploi.fr' }));
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .put(`/api/backoffice/accounts/me/updatePassword`)
        .set('authorization', `Bearer ${token}`)
        .send({
            current: 'INVALID',
            password: 'A1234!',
        });
        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body.message, 'Le mot de passe n\'est pas correct');
    });

    it('can not update password with weak password', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount({ courriel: 'admin@pole-emploi.fr' }));
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .put(`/api/backoffice/accounts/me/updatePassword`)
        .set('authorization', `Bearer ${token}`)
        .send({
            current: 'password',
            password: 'weak',
        });
        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body.message, 'Le mot de passe doit contenir au moins une minuscule, ' +
            'une majuscule et un chiffre et 6 caractères');
    });


}));
