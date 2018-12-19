const { randomize } = require('./data/dataset');
const configuration = require('config');
const logger = require('./test-logger');
const fakeMailer = require('./fake-mailer');
const createComponents = require('../../lib/common/createComponents');

let _componentsHolder = null;

module.exports = {
    withComponents: callback => {
        return () => {
            before(() => {
                _componentsHolder = createComponents({
                    configuration: Object.assign({}, configuration, {
                        mongodb: {
                            uri: configuration.mongodb.uri.split('anotea').join(randomize('anotea_test'))
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
