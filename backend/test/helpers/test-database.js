const path = require('path');
const logger = require('./test-logger');
const importIntercarif = require('../../lib/jobs/import/intercarif/importIntercarif');
const { withComponents } = require('./test-components');

module.exports = {
    withMongoDB: callback => {
        return withComponents(context => {

            let getTestDatabase = async () => {
                let { db } = await context.getComponents();
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

            return callback(Object.assign({}, context, {
                getTestDatabase,
                insertIntoDatabase,
                importIntercarif: async file => {
                    let intercarifFile = path.join(__dirname, 'data', 'intercarif-data-test.xml');
                    let db = await getTestDatabase();

                    return importIntercarif(db, logger, file || intercarifFile);
                },
                insertDepartements: async () => {

                    await Promise.all([
                        insertIntoDatabase('departements', {
                            region: 'Grand Est',
                            dept_num: '57',
                            region_num: '7'
                        }),
                        insertIntoDatabase('departements', {
                            region: 'Aquitaine',
                            dept_num: '33',
                            region_num: '1'
                        }),
                        insertIntoDatabase('departements', {
                            region: 'Hauts-de-France',
                            dept_num: '59',
                            region_num: '10'
                        }),
                        insertIntoDatabase('departements', {
                            region: 'Auvergne-Rhône-Alpes',
                            dept_num: '69',
                            region_num: '2',
                        }),
                        insertIntoDatabase('departements', {
                            region: 'Ile De France',
                            dept_num: '91',
                            region_num: '11',
                            codeFinanceur: '2'
                        }),
                        insertIntoDatabase('departements', {
                            region: 'Ile De France',
                            dept_num: '75',
                            region_num: '11',
                            codeFinanceur: '2'
                        }),
                        insertIntoDatabase('departements', {
                            region: 'Seine-Saint-Denis',
                            dept_num: '93',
                            region_num: '11'
                        }),
                        insertIntoDatabase('departements', {
                            region: 'Occitanie',
                            dept_num: '66',
                            region_num: '16'
                        })
                    ]);

                    let db = await getTestDatabase();
                    return db.collection('departements').createIndex({ region: 'text' });
                },
            }));
        });
    }
};
