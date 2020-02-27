const fs = require('fs');
const path = require('path');
const { randomize } = require('./data/dataset');
const config = require('config');
const createEmails = require('../../src/core/components/emails/emails');
const createRegions = require('../../src/core/components/regions');
const logger = require('./components/fake-logger');
const fakeMailer = require('./components/fake-mailer');
const fakePasswords = require('./components/fake-passwords');
const components = require('../../src/core/components');

let _componentsHolder = null;

module.exports = {
    withComponents: callback => {

        let regions = createRegions();
        let datalake = path.join(__dirname, '../../../.data/datalake/test-logs');
        let configuration = Object.assign({}, config, {
            mongodb: {
                uri: config.mongodb.uri.split('anotea').join(randomize('anotea_test').substring(0, 20))
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
        });
        let mailer = fakeMailer(configuration, regions);

        return () => {
            before(() => {
                _componentsHolder = components({
                    configuration,
                    logger,
                    mailer,
                    passwords: fakePasswords(configuration),
                });
            });

            afterEach(function() {
                mailer.flush();
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
                createEmailMocks: async mailerOptions => {
                    let { db, regions, templates } = await _componentsHolder;
                    let mailer = fakeMailer(configuration, regions, mailerOptions);
                    return {
                        mailer,
                        emails: createEmails(db, configuration, regions, mailer, templates)
                    };
                },
                getTestFile: fileName => path.join(__dirname, 'data', fileName)
            };

            return callback(testContext);
        };
    }
};
