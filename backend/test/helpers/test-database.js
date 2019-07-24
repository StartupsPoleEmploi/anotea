const path = require('path');
const logger = require('./test-logger');
const importIntercarif = require('../../src/jobs/import/intercarif/importIntercarif');
const reconcile = require('../../src/jobs/reconciliation/tasks/reconcile');
const mongoIndexes = require('../../src/jobs/data/indexes/tasks/mongoIndexes');
const { withComponents } = require('./test-components');

module.exports = {
    withMongoDB: callback => {
        return withComponents(testContext => {

            let getTestDatabase = async () => {
                let { db } = await testContext.getComponents();
                return db;
            };

            let insertIntoDatabase = async (collection, data) => {
                let db = await getTestDatabase();
                return db.collection(collection).insertOne(data);
            };

            afterEach(async () => {
                let db = await getTestDatabase();
                return db.dropDatabase();
            });

            return callback(Object.assign({}, testContext, {
                getTestDatabase,
                insertIntoDatabase,
                createIndexes: async (...collectionNames) => {
                    let db = await getTestDatabase();
                    return collectionNames.map(name => mongoIndexes[name](db));
                },
                importIntercarif: async file => {
                    let intercarifFile = path.join(__dirname, 'data', 'intercarif-data-test.xml');
                    let db = await getTestDatabase();
                    let { regions } = await testContext.getComponents();

                    return importIntercarif(db, logger, file || intercarifFile, regions);
                },
                reconcile: async options => {
                    let db = await getTestDatabase();
                    return reconcile(db, logger, options);
                },
            }));
        });
    }
};
