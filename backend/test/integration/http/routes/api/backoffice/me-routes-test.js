const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/test-server');
const { newModerateurAccount } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, logAsModerateur }) => {

    it('can update my password', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount({ courriel: 'admin@pole-emploi.fr' }));
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .put(`/api/backoffice/me/updatePassword`)
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

    it('can not update my password with invalid current password', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount({ courriel: 'admin@pole-emploi.fr' }));
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .put(`/api/backoffice/me/updatePassword`)
        .set('authorization', `Bearer ${token}`)
        .send({
            current: 'INVALID',
            password: 'A1234!',
        });
        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body.message, 'Le mot de passe n\'est pas correct');
    });

    it('can not update my password with weak password', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount({ courriel: 'admin@pole-emploi.fr' }));
        let token = await logAsModerateur(app, 'admin@pole-emploi.fr');

        let response = await request(app)
        .put(`/api/backoffice/me/updatePassword`)
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
