const { randomize } = require('./data/dataset');
const configuration = require('config');
const logger = require('./test-logger');
const fakeMailer = require('./fake-mailer');
const createComponents = require('../../components/components');

let _componentsHolder = null;

module.exports = {
    withComponents: callback => {
        return () => {
            before(() => {
                _componentsHolder = createComponents({
                    core: {
                        logger,
                        mailer: fakeMailer(),
                        configuration: Object.assign({}, configuration, {
                            mongodb: {
                                uri: configuration.mongodb.uri.split('anotea').join(randomize('anotea_test'))
                            },
                        }),
                    }
                });
            });

            return callback({
                getComponents: () => _componentsHolder,
            });
        };
    }
};
