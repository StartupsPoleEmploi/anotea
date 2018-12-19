const request = require('supertest');
const assert = require('assert');
const server = require('../../lib/http/createServer');
const { withMongoDB } = require('./test-db');
const { newModerateurAccount } = require('./data/dataset');

module.exports = {
    withServer: callback => {
        return withMongoDB(context => {
            return callback(Object.assign({}, context, {
                startServer: async () => {
                    return server(await context.getComponents());
                },
                logAsModerateur: async (app, courriel) => {

                    await context.insertIntoDatabase('moderator', newModerateurAccount({
                        courriel,
                    }));

                    let response = await request(app)
                    .post('/api/backoffice/login')
                    .send({ username: courriel, password: 'password' });
                    assert.equal(response.statusCode, 200);

                    return response.body.access_token;
                },
                generateKairosToken: async app => {
                    let { authService } = await context.getComponents();
                    let jwt = await authService.buildJWT('kairos', {
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
                        region: 'Ile De France',

                    });

                    return response.body.url;
                }
            }));
        });
    }
};
