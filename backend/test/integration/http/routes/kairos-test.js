const _ = require('lodash');
const JWT = require('jsonwebtoken');
const request = require('supertest');
const assert = require('assert');
const configuration = require('config');
const { withServer } = require('../../../helpers/test-server');
const { newOrganismeAccount, randomSIRET } = require('../../../helpers/data/dataset');
const auth = require('../../../../lib/common/components/auth');

describe(__filename, withServer(({ startServer, insertDepartements, insertIntoDatabase, getTestDatabase }) => {

    const insertOrganisme = async siret => {
        return insertIntoDatabase('organismes', newOrganismeAccount({
            _id: parseInt(siret),
            SIRET: parseInt(siret),
            raison_sociale: 'Pole Emploi Formation',
            courriel: 'contact@organisme.fr',
            code_region: '11',
            meta: {
                siretAsString: siret
            },
        }));
    };

    const createPayload = siret => {
        return {
            siret: siret,
            raison_sociale: 'Pole Emploi Formation',
            courriel: 'contact@organisme.fr',
            region: 'Ile De France',
        };
    };

    it('can get authentication url for an existing organisme', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });

        await Promise.all([insertDepartements(), insertOrganisme(siret)]);

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));

        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.body.meta, {
            organisme: {
                siret,
                raison_sociale: 'Pole Emploi Formation',
                code_region: '11',
            }
        });
        assert.ok(response.body.url.startsWith('http://127.0.0.1:3000/admin?action=loginWithAccessToken&access_token=ey'));
    });

    it('when organisme is unknown, it is created during authentication url generation', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });
        let db = await getTestDatabase();
        await insertDepartements();

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));

        assert.equal(response.statusCode, 200);
        let organisme = await db.collection('organismes').findOne({ 'meta.siretAsString': siret });
        assert.deepEqual(_.omit(organisme, ['token', 'creationDate']), {
            _id: parseInt(siret),
            SIRET: parseInt(siret),
            raisonSociale: 'Pole Emploi Formation',
            courriel: 'contact@organisme.fr',
            courriels: ['contact@organisme.fr'],
            kairosCourriel: 'contact@organisme.fr',
            sources: [
                'kairos',
                'sso'
            ],
            codeRegion: '11',
            numero: null,
            lieux_de_formation: [],
            meta: {
                siretAsString: siret,
            }
        });

    });

    it('can login with auth url', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });

        await Promise.all([insertDepartements(), insertOrganisme(siret)]);

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));
        assert.equal(response.statusCode, 200);

        let token = response.body.url.split('=')[2];
        response = await request(app)
        .get(`/api/backoffice/login?access_token=${token}`);

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.token_type, 'bearer');
        assert.ok(response.body.access_token);

        let decodedToken = JWT.decode(response.body.access_token);
        assert.ok(decodedToken.iat);
        assert.ok(decodedToken.exp);
        assert.deepEqual(_.omit(decodedToken, ['iat', 'exp', 'id']), {
            profile: 'organisme',
            raisonSociale: 'Pole Emploi Formation',
            sub: siret,
            siret: siret,
            codeRegion: '11',
        });
    });

    it('should invalidate auth token after first login', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });

        await Promise.all([insertDepartements(), insertOrganisme(siret)]);

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));
        assert.equal(response.statusCode, 200);

        let token = response.body.url.split('=')[2];

        response = await request(app)
        .get(`/api/backoffice/login?access_token=${token}`);
        assert.equal(response.statusCode, 200);

        response = await request(app)
        .get(`/api/backoffice/login?access_token=${token}`);
        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.body, {
            error: 'Bad Request',
            message: 'Token déjà utilisé',
            statusCode: 400,
        });
    });

    it('should fail when kairos token is expired', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let sixMinutesAgo = Math.floor(Date.now() / 1000) - 360;
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: sixMinutesAgo });

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(randomSIRET()));

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Token expiré',
            statusCode: 401,
        });
    });

    it('should fail when kairos token is issued in the future', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: 999999999999999 });

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(randomSIRET()));

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Token invalide',
            statusCode: 401,
        });
    });

    it('should fail when kairos token is invalid', async () => {

        let app = await startServer();

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer INVALID`)
        .send(createPayload(randomSIRET()));

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Token invalide',
            statusCode: 401,
        });
    });

    it('should fail when subject token is invalid', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let jwt = await buildJWT('kairos', { sub: 'INVALID' });

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(randomSIRET()));

        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.body, {
            error: 'Unauthorized',
            message: 'Token invalide',
            statusCode: 401,
        });
    });

    it('should fail when body is invalid', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send({});

        assert.equal(response.statusCode, 400);
        assert.deepEqual(response.body, {
            statusCode: 400,
            error: 'Bad Request',
            message: 'Erreur de validation',
            details: [
                {
                    message: '"siret" is required',
                    path: [
                        'siret'
                    ],
                    type: 'any.required',
                    context: {
                        key: 'siret',
                        label: 'siret'
                    }
                },
                {
                    message: '"raison_sociale" is required',
                    path: [
                        'raison_sociale'
                    ],
                    type: 'any.required',
                    context: {
                        key: 'raison_sociale',
                        label: 'raison_sociale'
                    }
                },
                {
                    message: '"courriel" is required',
                    path: [
                        'courriel'
                    ],
                    type: 'any.required',
                    context: {
                        key: 'courriel',
                        label: 'courriel'
                    }
                },
                {
                    message: '"region" is required',
                    path: [
                        'region'
                    ],
                    type: 'any.required',
                    context: {
                        key: 'region',
                        label: 'region'
                    }
                }
            ]
        });
    });

}));

