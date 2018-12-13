const request = require('supertest');
const assert = require('assert');
const configuration = require('config');
const server = require('../../server');
const logger = require('./test-logger');
const { withMongoDB } = require('./test-db');
const { newModerateurAccount } = require('./data/dataset');
const createComponents = require('../../components/components');

module.exports = {
    withServer: callback => {
        return withMongoDB(mongoContext => {
            let context = {
                startServer: async () => {
                    let context = await createComponents({
                        configuration: Object.assign({}, configuration, {
                            mongodb: {
                                uri: mongoContext.uri
                            },
                        }),
                        context: {
                            logger,
                        }
                    });

                    return server(context);
                },
                logAsModerateur: async (app, courriel) => {

                    await mongoContext.insertIntoDatabase('moderator', newModerateurAccount({
                        courriel,
                    }));

                    let response = await request(app)
                    .post('/api/backoffice/login')
                    .send({ username: courriel, password: 'password' });
                    assert.equal(response.statusCode, 200);

                    return response.body.access_token;
                },
            };
            return callback(Object.assign({}, mongoContext, context));
        });
    }
};
