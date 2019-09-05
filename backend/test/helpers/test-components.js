const fs = require('fs');
const path = require('path');
const { randomize } = require('./data/dataset');
const configuration = require('config');
const logger = require('./test-logger');
const fakeMailer = require('./fake-mailer');
const components = require('../../src/components');

let _componentsHolder = null;

module.exports = {
    withComponents: callback => {

        let datalake = path.join(__dirname, '../../../.data/datalake/test-logs');

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
                        log: {
                            datalake: {
                                fileNamePrefix: randomize('anotea'),
                                path: datalake,
                            }
                        },
                    }),
                    logger,
                    mailer: fakeMailer(),
                });
            });

            after(async () => {

                let components = await _componentsHolder;

                fs.readdir(datalake, (err, files) => {
                    if (err) {
                        logger.error(err);
                        return;
                    }

                    files.forEach(file => {
                        if (file.startsWith(components.configuration.log.datalake.fileNamePrefix)) {
                            let p = path.join(datalake, file);
                            fs.unlinkSync(p);
                            logger.debug(`${p} test file removed`);
                        }
                    });
                });
            });

            let testContext = {
                getComponents: () => _componentsHolder,
                getTestFile: fileName => path.join(__dirname, 'data', fileName)
            };

            return callback(testContext);
        };
    }
};
