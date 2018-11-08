const path = require('path');
const mongo = require('mongodb');
const { randomize } = require('./data/dataset');
const configuration = require('config');
const logger = require('./test-logger');
const importIntercarif = require('../../jobs/import/intercarif/steps/importIntercarif');

let _mongoClientHolder = null;

module.exports = {
    withMongoDB: tests => {

        let dbName = randomize('anotea_test');
        let uri = configuration.mongodb.uri.split('anotea').join(dbName);

        let connect = async () => {
            _mongoClientHolder = mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true });
        };

        let disconnect = async () => {
            let client = await _mongoClientHolder;
            return client.close();
        };


        return () => {
            before(() => connect());
            after(() => disconnect());

            afterEach(async () => {
                let client = await _mongoClientHolder;

                return Promise.all([
                    client.db(dbName).dropDatabase(),
                    client.db().collection('comment').remove({ test: true })
                ]);
            });

            let getTestDatabase = async () => {
                let client = await _mongoClientHolder;
                return client.db(dbName);
            };

            return tests({
                dbName,
                uri,
                getTestDatabase,
                insertIntoDatabase: async (collection, data) => {
                    let client = await _mongoClientHolder;
                    return client.db(dbName).collection(collection).insert(data);
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
