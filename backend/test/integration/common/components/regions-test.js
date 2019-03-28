const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../helpers/test-database');
const regions = require('../../../../src/common/components/regions');

describe(__filename, withMongoDB(({ getTestDatabase, insertRegions }) => {

    it('can get regions by name', async () => {

        let db = await getTestDatabase();
        let { findCodeRegionByName } = regions(db, configuration);
        await insertRegions();

        assert.strictEqual(await findCodeRegionByName('Grand Est'), '7');
        assert.strictEqual(await findCodeRegionByName('Aquitaine'), '15');
        assert.strictEqual(await findCodeRegionByName('Hauts-De-France'), '10');
    });
}));
