const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../helpers/test-server');
const { newOrganismeAccount, newCarif, newForgottenPasswordToken, randomize } = require('../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase, getComponents }) => {

    it('can ask for a new password', async () => {

        let app = await startServer();
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                courriel: 'contactus@poleemploi-formation.fr',
                meta: {
                    siretAsString: '6080274100045'
                }
            })),
            insertIntoDatabase('carif', newCarif({ codeRegion: '11' }))
        ]);

        let response = await request(app)
        .put('/api/backoffice/askNewPassword')
        .send({ username: '6080274100045' });

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            message: 'mail sent',
        });

        let { mailer } = await getComponents();
        let email = mailer.getCalls()[0];
        assert.deepEqual(email[0], { to: 'contactus@poleemploi-formation.fr' });
    });

    it('can not ask for a new password with an invalid identifier', async () => {

        let app = await startServer();

        let response = await request(app)
        .put('/api/backoffice/askNewPassword')
        .send({ username: 'INVALID' });

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.body, {
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

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body, {
            message: 'token exists',
        });
    });

    it('can update password', async () => {

        let app = await startServer();
        let token = randomize('token');
        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            meta: {
                siretAsString: '11111111111111',
            },
        }));
        await insertIntoDatabase('forgottenPasswordTokens', newForgottenPasswordToken({
            id: 11111111111111,
            token,
        }));

        let response = await request(app)
        .put(`/api/backoffice/updatePassword`)
        .send({
            token,
            password: 'A1234!',
        });

        assert.equal(response.statusCode, 201);
        assert.deepEqual(response.body.message, 'Account successfully updated');

        //Token should be remove
        response = await request(app)
        .get(`/api/backoffice/checkIfPasswordTokenExists?token=${token}`);
        assert.equal(response.statusCode, 404);
        assert.deepEqual(response.body, { error: 'Not found' });

        //can login with new password
        response = await request(app)
        .post('/api/backoffice/login')
        .send({ username: '11111111111111', password: 'A1234!' });
        assert.equal(response.statusCode, 200);

        //should flag account as rehashed
        let db = await getTestDatabase();
        let res = await db.collection('organismes').findOne({ _id: 11111111111111 });
        assert.ok(res.meta);
        assert.ok(res.meta.rehashed);
    });


    it('cannot update password with weak password', async () => {

        let app = await startServer();
        let id = randomize('id');
        let courriel = `${randomize('contact')}@sociale.fr`;
        let token = randomize('token');
        await insertIntoDatabase('organismes', newOrganismeAccount({
            _id: id,
            courriel,
        }));
        await insertIntoDatabase('forgottenPasswordTokens', newForgottenPasswordToken({
            id: id,
            token,
        }));

        let response = await request(app)
        .put(`/api/backoffice/updatePassword`)
        .send({
            token,
            password: 'INVALID'
        });

        assert.equal(response.statusCode, 422);
    });
}));
