const assert = require('assert');
const { withMongoDB } = require('../../../helpers/test-database');
const regions = require('../../../../src/common/components/regions');

describe(__filename, withMongoDB(({ getTestDatabase, insertDepartements }) => {

    it('can get regions by name', async () => {

        let db = await getTestDatabase();
        let { findCodeRegionByName } = regions(db);
        await insertDepartements();

        assert.deepEqual(await findCodeRegionByName('Grand Est'), '7');
        assert.deepEqual(await findCodeRegionByName('Aquitaine'), '1');
        assert.deepEqual(await findCodeRegionByName('Hauts-De-France'), '10');
    });
}));
