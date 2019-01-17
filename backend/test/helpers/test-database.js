const path = require('path');
const logger = require('./test-logger');
const importIntercarif = require('../../src/jobs/import/intercarif/importIntercarif');
const indexes = require('../../src/jobs/data/indexes/allIndexes');
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
                createIndexes: async (...collectionNames) => {
                    let db = await getTestDatabase();
                    return collectionNames.map(name => {
                        return indexes[name](db);
                    });
                },
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
                    return indexes.departements(db);
                },
                insertRegions: async () => {

                    await Promise.all([
                        insertIntoDatabase('regions', {
                            codeINSEE: '1',
                            codeRegion: '8',
                            name: 'Guadeloupe'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '2',
                            codeRegion: '13',
                            name: 'Martinique'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '3',
                            codeRegion: '9',
                            name: 'Guyane'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '4',
                            codeRegion: '12',
                            name: 'La Réunion'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '6',
                            codeRegion: '12',
                            name: 'Mayotte'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '11',
                            codeRegion: '11',
                            name: 'Île-de-France'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '24',
                            codeRegion: '5',
                            name: 'Centre-Val de Loire'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '27',
                            codeRegion: '3',
                            name: 'Bourgogne-Franche-Comté'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '28',
                            codeRegion: '14',
                            name: 'Normandie'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '32',
                            codeRegion: '10',
                            name: 'Hauts-de-France'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '52',
                            codeRegion: '17',
                            name: 'Pays de la Loire'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '53',
                            codeRegion: '4',
                            name: 'Bretagne'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '75',
                            codeRegion: '15',
                            name: 'Nouvelle-Aquitaine'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '84',
                            codeRegion: '2',
                            name: 'Auvergne-Rhône-Alpes'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '93',
                            codeRegion: '18',
                            name: 'Provence-Alpes-Côte d\'Azur'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '94',
                            codeRegion: '6',
                            name: 'Corse'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '76',
                            codeRegion: '16',
                            name: 'Occitanie'
                        }),
                        insertIntoDatabase('regions', {
                            codeINSEE: '44',
                            codeRegion: '7',
                            name: 'Grand-Est'
                        }),
                    ]);

                    let db = await getTestDatabase();
                    return indexes.departements(db);
                },
            }));
        });
    }
};
