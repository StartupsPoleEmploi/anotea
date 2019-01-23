const { randomize } = require('./data/dataset');
const configuration = require('config');
const logger = require('./test-logger');
const fakeMailer = require('./fake-mailer');
const components = require('../../src/components');

let _componentsHolder = null;

module.exports = {
    withComponents: callback => {
        return () => {
            before(() => {

                let uri = configuration.mongodb.uri.split('anotea').join(randomize('anotea_test').substring(0, 20));
                _componentsHolder = components({
                    configuration: Object.assign({}, configuration, {
                        mongodb: {
                            uri: uri
                        },
                        api: {
                            pagination: 2,
                        },
                    }),
                    logger,
                    mailer: fakeMailer(),
                });
            });

            return callback({
                getComponents: () => _componentsHolder,
            });
        };
    }
};
