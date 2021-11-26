const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/with-server');
const { newOrganismeAccount, newForgottenPasswordToken, randomize } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase, getComponents }) => {

    it('can ask for a new password', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '6080274100045',
                courriel: 'contactus@poleemploi-formation.fr',
            })),
        ]);

        let response = await request(app)
        .put('/api/backoffice/askNewPassword')
        .send({ identifiant: '6080274100045' });

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            message: 'mail sent',
        });

        let { mailer } = await getComponents();
        let message = mailer.getLastEmailMessageSent();

        assert.strictEqual(message.email, 'contactus@poleemploi-formation.fr');
    });

    it('can not ask for a new password with an invalid identifier', async () => {

        let app = await startServer();

        let response = await request(app)
        .put('/api/backoffice/askNewPassword')
        .send({ identifiant: 'INVALID' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Identifiant invalide'
        });
    });

    it('can check if password token exists', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('forgottenPasswordTokens', newForgottenPasswordToken({
            token,
        }));

        let response = await request(app)
        .get(`/api/backoffice/checkIfPasswordTokenExists?token=${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            message: 'token exists',
        });
    });

    it('can reset password', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: '1234',
            siret: '11111111111111',
        }));
        await insertIntoDatabase('forgottenPasswordTokens', newForgottenPasswordToken({
            creationDate: new Date(),
            id: '1234',
            token,
            profile: 'organisme'
        }));

        let response = await request(app)
        .put(`/api/backoffice/resetPassword`)
        .send({
            token,
            password: 'Aze1234!',
        });
        assert.strictEqual(response.statusCode, 200);

        //Token should be remove
        response = await request(app)
        .get(`/api/backoffice/checkIfPasswordTokenExists?token=${token}`);
        assert.strictEqual(response.statusCode, 404);
        assert.deepStrictEqual(response.body, { error: 'Not found' });

        //can login with new password
        response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: '11111111111111', password: 'Aze1234!' });
        assert.strictEqual(response.statusCode, 200);

        //should flag account as rehashed
        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ siret: '11111111111111' });
        assert.ok(res.meta);
        assert.ok(res.meta.rehashed);
    });

    it('can not reset password with weak password', async () => {

        let app = await startServer();
        let id = randomize('id');
        let courriel = `${randomize('contact')}@sociale.fr`;
        let token = randomize('token');
        await insertIntoDatabase('accounts', newOrganismeAccount({
            _id: id,
            courriel,
        }));
        await insertIntoDatabase('forgottenPasswordTokens', newForgottenPasswordToken({
            creationDate: new Date(),
            id,
            token,
            profile: 'organisme'
        }));

        let response = await request(app)
        .put(`/api/backoffice/resetPassword`)
        .send({
            token,
            password: 'INVALID'
        });

        assert.strictEqual(response.statusCode, 400);
    });
}));
