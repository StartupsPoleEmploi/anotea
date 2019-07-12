const request = require('supertest');
const assert = require('assert');
const server = require('../../src/http/server');
const { withMongoDB } = require('./test-database');
const { newModerateurAccount, newOrganismeAccount, newFinancerAccount } = require('./data/dataset');

module.exports = {
    withServer: callback => {

        return withMongoDB(context => {
            return callback(Object.assign({}, context, {
                startServer: async () => {
                    return server(await context.getComponents());
                },
                logAsModerateur: async (app, courriel) => {

                    await context.insertIntoDatabase('accounts', newModerateurAccount({
                        courriel,
                    }));

                    let response = await request(app)
                    .post('/api/backoffice/login')
                    .send({ username: courriel, password: 'password' });
                    assert.strictEqual(response.statusCode, 200);

                    return response.body.access_token;
                },
                logAsOrganisme: async (app, courriel, id) => {

                    const organisme = newOrganismeAccount({
                        _id: id,
                        SIRET: id,
                        courriel,
                        meta: {
                            siretAsString: `${id}`
                        },
                    });

                    await context.insertIntoDatabase('accounts', organisme);

                    let response = await request(app)
                    .post('/api/backoffice/login')
                    .send({ username: organisme.meta.siretAsString, password: 'password' });
                    assert.strictEqual(response.statusCode, 200);

                    return response.body.access_token;
                },
                logAsFinancer: async (app, courriel, codeFinanceur) => {

                    await context.insertIntoDatabase('accounts', newFinancerAccount({
                        courriel,
                        codeFinanceur: `${codeFinanceur}`
                    }));

                    let response = await request(app)
                    .post('/api/backoffice/login')
                    .send({ username: courriel, password: 'password' });
                    assert.strictEqual(response.statusCode, 200);

                    return response.body.access_token;
                },
                generateKairosToken: async app => {
                    let { auth } = await context.getComponents();
                    let jwt = await auth.buildJWT('kairos', {
                        sub: 'kairos',
                        iat: Math.floor(Date.now() / 1000)
                    });

                    let response = await request(app)
                    .post('/api/backoffice/generate-auth-url')
                    .set('authorization', `Bearer ${jwt.access_token}`)
                    .send({
                        siret: '22222222222222',
                        raison_sociale: 'Pole Emploi Formation',
                        courriel: 'contact@organisme.fr',
                        region: 'Ile-de-France',

                    });

                    return response.body.url;
                }
            }));
        });
    }
};
