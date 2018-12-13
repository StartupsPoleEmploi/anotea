const path = require('path');
const logger = require('./test-logger');
const importIntercarif = require('../../jobs/import/intercarif/importIntercarif');
const { withComponents } = require('./test-components');

module.exports = {
    withMongoDB: callback => {
        return withComponents(context => {

            let getTestDatabase = async () => {
                let { db } = await context.getComponents();
                return db;
            };

            afterEach(async () => {
                let db = await getTestDatabase();
                return db.dropDatabase();
            });

            return callback(Object.assign({}, context, {
                getTestDatabase,
                insertIntoDatabase: async (collection, data) => {
                    let db = await getTestDatabase();
                    return db.collection(collection).insertOne(data);
                },
                importIntercarif: async file => {
                    let intercarifFile = path.join(__dirname, 'data', 'intercarif-data-test.xml');
                    let db = await getTestDatabase();

                    return importIntercarif(db, logger, file || intercarifFile);
                },
            }));
        });
    }
};
