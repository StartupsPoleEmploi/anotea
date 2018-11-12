const path = require('path');
const mongo = require('mongodb');
const { randomize } = require('./data/dataset');
const logger = require('./test-logger');
const importIntercarif = require('../../jobs/import/intercarif/steps/importIntercarif');

let _mongoClientHolder = null;

let connect = async () => {
    _mongoClientHolder = mongo.connect(`mongodb://127.0.0.1:27017/anotea?w=1`, { useNewUrlParser: true });
};

let disconnect = async () => {
    let client = await _mongoClientHolder;
    return client.close();
};

module.exports = {
    withMongoDB: tests => {

        const dbName = randomize('anotea_test');

        return () => {
            before(() => connect());
            after(() => disconnect());

            afterEach(async () => {
                let client = await _mongoClientHolder;

                return Promise.all([
                    client.db(dbName).dropDatabase(),
                    client.db().collection('comment').deleteMany({ test: true })
                ]);
            });

            let getTestDatabase = async () => {
                let client = await _mongoClientHolder;
                return client.db(dbName);
            };

            return tests({
                dbName,
                getTestDatabase,
                insertIntoDatabase: async (collection, data) => {
                    let client = await _mongoClientHolder;
                    return client.db(dbName).collection(collection).insertOne(data);
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
