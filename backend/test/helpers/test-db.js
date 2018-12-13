const path = require('path');
const { randomize } = require('./data/dataset');
const configuration = require('config');
const logger = require('./test-logger');
const fakeMailer = require('./fake-mailer');
const importIntercarif = require('../../jobs/import/intercarif/importIntercarif');
const createComponents = require('../../components/components');

let _componentsHolder = null;

module.exports = {
    withMongoDB: callback => {

        let dbName = randomize('anotea_test');
        let uri = configuration.mongodb.uri.split('anotea').join(dbName);

        let connect = async () => {
            _componentsHolder = createComponents({
                core: {
                    logger,
                    mailer: fakeMailer(),
                    configuration: Object.assign({}, configuration, {
                        mongodb: {
                            uri
                        },
                    }),
                }
            });
        };

        let getTestDatabase = async () => {
            let { db } = await _componentsHolder;
            return db;
        };

        return () => {

            before(() => connect());
            afterEach(async () => {
                let db = await getTestDatabase();
                return db.dropDatabase();
            });

            return callback({
                dbName,
                uri,
                getComponents: () => _componentsHolder,
                getTestDatabase,
                insertIntoDatabase: async (collection, data) => {
                    let { db } = await _componentsHolder;
                    return db.collection(collection).insertOne(data);
                },
                importIntercarif: async file => {
                    let intercarifFile = path.join(__dirname, 'data', 'intercarif-data-test.xml');
                    let db = await getTestDatabase();

                    return importIntercarif(db, logger, file || intercarifFile);
                },
            });
        };
    }
};
