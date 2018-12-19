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
            }));
        });
    }
};
