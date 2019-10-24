const JWT = require('jsonwebtoken');
const _ = require('lodash');
const request = require('supertest');
const assert = require('assert');
const { withServer } = require('../../../../../helpers/with-server');
const { newModerateurAccount, newOrganismeAccount, newFinancerAccount } = require('../../../../../helpers/data/dataset');

describe(__filename, withServer(({ startServer, generateKairosToken, insertIntoDatabase, getTestDatabase }) => {

    it('can login as moderator', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount());

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'admin@pole-emploi.fr', password: 'password' });

        assert.strictEqual(response.statusCode, 200);

        let body = response.body;
        assert.strictEqual(body.token_type, 'bearer');
        assert.ok(body.access_token);

        let decodedToken = JWT.decode(body.access_token);
        assert.ok(decodedToken.iat);
        assert.ok(decodedToken.exp);
        assert.deepStrictEqual(_.omit(decodedToken, ['iat', 'exp', 'id']), {
            codeRegion: '11',
            profile: 'moderateur',
            sub: 'admin@pole-emploi.fr',
        });
    });

    it('can login as organisme', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newOrganismeAccount({
            meta: {
                siretAsString: '6080274100045'
            }
        }));

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: '6080274100045', password: 'password' });

        assert.strictEqual(response.statusCode, 200);

        let body = response.body;
        assert.strictEqual(body.token_type, 'bearer');
        assert.ok(body.access_token);

        let decodedToken = JWT.decode(body.access_token);
        assert.ok(decodedToken.iat);
        assert.ok(decodedToken.exp);
        assert.deepStrictEqual(_.omit(decodedToken, ['iat', 'exp', 'id']), {
            profile: 'organisme',
            raisonSociale: 'Pole Emploi Formation',
            siret: '6080274100045',
            sub: '6080274100045',
            codeRegion: '11',
        });
    });

    it('can login as organisme (email)', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newOrganismeAccount({
            courriel: 'contact@poleemploi-formation.fr',
            meta: {
                siretAsString: '6080274100045'
            }
        }));

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'contact@poleemploi-formation.fr', password: 'password' });

        assert.strictEqual(response.statusCode, 200);

        let body = response.body;
        assert.strictEqual(body.token_type, 'bearer');
        assert.ok(body.access_token);

        let decodedToken = JWT.decode(body.access_token);
        assert.ok(decodedToken.iat);
        assert.ok(decodedToken.exp);
        assert.deepStrictEqual(_.omit(decodedToken, ['iat', 'exp', 'id']), {
            profile: 'organisme',
            raisonSociale: 'Pole Emploi Formation',
            siret: '6080274100045',
            sub: 'contact@poleemploi-formation.fr',
            codeRegion: '11',
        });
    });

    it('can login as financeur', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newFinancerAccount({
            courriel: 'contact@financer.fr',
        }));

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'contact@financer.fr', password: 'password' });

        assert.strictEqual(response.statusCode, 200);

        let body = response.body;
        assert.strictEqual(body.token_type, 'bearer');
        assert.ok(body.access_token);

        let decodedToken = JWT.decode(body.access_token);
        assert.ok(decodedToken.iat);
        assert.ok(decodedToken.exp);
        assert.deepStrictEqual(_.omit(decodedToken, ['iat', 'exp', 'id']), {
            profile: 'financeur',
            codeRegion: '11',
            codeFinanceur: '2',
            sub: 'contact@financer.fr'
        });
    });

    it('can login with a legacy password', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount({
            //old sha256 password hash + bcrypt
            passwordHash: '$2a$10$ReqjdfD4zLGnxpHIQGjVAOBHO7DezHlEMeidmLLQ1P1Kdl2dAMaAG'
        }));

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'admin@pole-emploi.fr', password: 'password' });

        assert.strictEqual(response.statusCode, 200);
    });

    it('should rehash password', async () => {

        let app = await startServer();
        let account = newModerateurAccount({
            //old sha256 password hash + bcrypt
            passwordHash: '$2a$10$ReqjdfD4zLGnxpHIQGjVAOBHO7DezHlEMeidmLLQ1P1Kdl2dAMaAG',
            meta: {
                rehashed: false,
            },
        });
        await insertIntoDatabase('accounts', account);

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'admin@pole-emploi.fr', password: 'password' });
        assert.strictEqual(response.statusCode, 200);

        let db = await getTestDatabase();
        let res = await db.collection('accounts').findOne({ _id: account._id });
        assert.ok(res.meta);
        assert.ok(res.meta.rehashed);

        // user can login
        response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'admin@pole-emploi.fr', password: 'password' });
        assert.strictEqual(response.statusCode, 200);
    });


    it('should reject login when credentials are invalid', async () => {

        let app = await startServer();
        await insertIntoDatabase('accounts', newModerateurAccount());

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: 'invalid@email.fr', password: 'password' });

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Identifiant ou mot de passe invalide'
        });
    });

    it('should reject login when organisme account has not been created', async () => {

        let app = await startServer();
        let account = newOrganismeAccount({
            meta: {
                siretAsString: '6080274100045'
            },
        });
        delete account.passwordHash;
        await insertIntoDatabase('accounts', account);

        let response = await request(app)
        .post('/api/backoffice/login')
        .send({ identifiant: '6080274100045', password: 'password' });

        assert.strictEqual(response.statusCode, 400);

        let body = response.body;
        assert.deepStrictEqual(body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Identifiant ou mot de passe invalide'
        });
    });

    it('can login with access_token', async () => {

        let db = await getTestDatabase();
        let app = await startServer();

        let authUrl = await generateKairosToken(app);

        let response = await request(app)
        .get(`/api/backoffice/login?access_token=${authUrl.split('access_token=')[1]}`);

        assert.deepStrictEqual(response.statusCode, 200);
        assert.ok(response.body.access_token);
        let event = await db.collection('events').findOne({ type: 'login-access-token' });
        assert.ok(event.date);
        assert.deepStrictEqual(event.source.siret, '22222222222222');
    });


    it('can not login with invalid auth url', async () => {

        let app = await startServer();

        let response = await request(app)
        .get('/api/backoffice/login?access_token=INVALID');

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body.message, 'Token invalide');
    });

    it('can not access a ressource with invalid token', async () => {

        let app = await startServer();

        let response = await request(app)
        .get('/api/v1/ping/authenticated')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9maWxlIjoiZmluYW.INVALID');

        assert.strictEqual(response.statusCode, 401);
    });
}));
