const assert = require('assert');
const { withMongoDB } = require('../../helpers/test-db');
const regions = require('../../../components/regions');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    const insertRegions = async () => {
        let db = await getTestDatabase();
        return Promise.all([
            db.collection('regions').createIndex({ region: 'text' }),
            insertIntoDatabase('regions', {
                region: 'Grand Est',
                dept_num: '57',
                region_num: '7'
            }),
            insertIntoDatabase('regions', {
                region: 'Aquitaine',
                dept_num: '33',
                region_num: '1'
            }),
            insertIntoDatabase('regions', {
                region: 'Hauts-de-France',
                dept_num: '59',
                region_num: '10'
            }),
        ]);
    };

    it('can get regions by name', async () => {

        let db = await getTestDatabase();
        let { findCodeRegionByName } = regions(db);
        await insertRegions();

        assert.deepEqual(await findCodeRegionByName('Grand Est'), '7');
        assert.deepEqual(await findCodeRegionByName('Aquitaine'), '1');
        assert.deepEqual(await findCodeRegionByName('Hauts-De-France'), '10');
    });
}));
