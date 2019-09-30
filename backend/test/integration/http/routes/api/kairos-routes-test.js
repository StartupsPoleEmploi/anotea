const _ = require('lodash');
const JWT = require('jsonwebtoken');
const request = require('supertest');
const assert = require('assert');
const configuration = require('config');
const { withServer } = require('../../../../helpers/test-server');
const { newOrganismeAccount, randomSIRET } = require('../../../../helpers/data/dataset');
const auth = require('../../../../../src/common/components/auth');

describe(__filename, withServer(({ startServer, insertIntoDatabase, getTestDatabase }) => {

    const insertOrganisme = async siret => {
        return insertIntoDatabase('accounts', newOrganismeAccount({
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
            region: 'Ile-de-France',
        };
    };

    it('can get authentication url for an existing organisme', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });
        await insertOrganisme(siret);

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.meta, {
            created: false,
            organisme: {
                id: siret,
                raison_sociale: 'Pole Emploi Formation',
                siret: siret,
                numero: '14_OF_0000000123',
                lieux_de_formation: [
                    {
                        adresse: {
                            code_postal: '75019',
                            ville: 'Paris 19e',
                            region: '11'
                        }
                    }
                ],
                score: {
                    nb_avis: 15,
                    notes: {
                        accueil: 5.1,
                        contenu_formation: 5.1,
                        equipe_formateurs: 4.1,
                        moyen_materiel: 3.1,
                        accompagnement: 4.1,
                        global: 5.1,
                    },
                    aggregation: {
                        global: {
                            max: 5.1,
                            min: 1,
                        },
                    },
                }
            }
        });
        assert.ok(response.body.url.startsWith('http://127.0.0.1:3000/admin/login?origin=kairos&access_token=ey'));
    });

    it('when organisme is unknown, it is created during authentication url generation', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });
        let db = await getTestDatabase();

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.meta.created, true);

        let organisme = await db.collection('accounts').findOne({ 'meta.siretAsString': siret });
        assert.deepStrictEqual(_.omit(organisme, ['token', 'creationDate']), {
            _id: parseInt(siret),
            SIRET: parseInt(siret),
            raisonSociale: 'Pole Emploi Formation',
            courriel: 'contact@organisme.fr',
            courriels: ['contact@organisme.fr'],
            kairosCourriel: 'contact@organisme.fr',
            sources: ['kairos', 'sso'],
            profile: 'organisme',
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
        await insertOrganisme(siret);

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));
        assert.strictEqual(response.statusCode, 200);

        let token = response.body.url.split('=')[2];
        response = await request(app)
        .get(`/api/backoffice/login?access_token=${token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body.token_type, 'bearer');
        assert.ok(response.body.access_token);

        let decodedToken = JWT.decode(response.body.access_token);
        assert.ok(decodedToken.iat);
        assert.ok(decodedToken.exp);
        assert.deepStrictEqual(_.omit(decodedToken, ['iat', 'exp', 'id']), {
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
        await insertOrganisme(siret);

        let response = await request(app)
        .post('/api/backoffice/generate-auth-url')
        .set('authorization', `Bearer ${jwt.access_token}`)
        .send(createPayload(siret));
        assert.strictEqual(response.statusCode, 200);

        let token = response.body.url.split('=')[2];

        response = await request(app)
        .get(`/api/backoffice/login?access_token=${token}`);
        assert.strictEqual(response.statusCode, 200);

        response = await request(app)
        .get(`/api/backoffice/login?access_token=${token}`);
        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
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

        assert.strictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.body, {
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

        assert.strictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.body, {
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

        assert.strictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.body, {
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

        assert.strictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.body, {
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

        assert.strictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.body, {
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

    it('can check if organisme is eligible', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: parseInt(siret),
                SIRET: parseInt(siret),
                raison_sociale: 'Pole Emploi Formation',
                courriel: 'contact@organisme.fr',
                code_region: '11',
                meta: {
                    siretAsString: siret,
                    kairos: {
                        eligible: true,
                    },
                },
            }))
        ]);

        let response = await request(app)
        .get(`/api/kairos/check-if-organisme-is-eligible?siret=${siret}`)
        .set('authorization', `Bearer ${jwt.access_token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body, {
            eligible: true,
            meta: {
                organisme: {
                    id: siret,
                    raison_sociale: 'Pole Emploi Formation',
                    siret: siret,
                    numero: '14_OF_0000000123',
                    lieux_de_formation: [
                        {
                            adresse: {
                                code_postal: '75019',
                                ville: 'Paris 19e',
                                region: '11'
                            }
                        }
                    ],
                    score: {
                        nb_avis: 15,
                        notes: {
                            accueil: 5.1,
                            contenu_formation: 5.1,
                            equipe_formateurs: 4.1,
                            moyen_materiel: 3.1,
                            accompagnement: 4.1,
                            global: 5.1,
                        },
                        aggregation: {
                            global: {
                                max: 5.1,
                                min: 1,
                            },
                        },
                    }
                }
            }
        });
    });

    it('an organisme without avis should not be eligible', async () => {

        let app = await startServer();
        let { buildJWT } = auth(configuration);
        let siret = randomSIRET();
        let jwt = await buildJWT('kairos', { sub: 'kairos', iat: Math.floor(Date.now() / 1000) });

        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: parseInt(siret),
                SIRET: parseInt(siret),
                score: {
                    nb_avis: 0,
                },
                meta: {
                    siretAsString: siret,
                    kairos: {
                        eligible: true,
                    },
                },
            }))
        ]);

        let response = await request(app)
        .get(`/api/kairos/check-if-organisme-is-eligible?siret=${siret}`)
        .set('authorization', `Bearer ${jwt.access_token}`);

        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.body.eligible, false);
    });

}));

