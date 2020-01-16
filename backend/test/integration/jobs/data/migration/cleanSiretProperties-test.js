const assert = require('assert');

const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');
const cleanSiretProperties = require('../../../../../src/jobs/data/migration/tasks/cleanSiretProperties');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('should remove numerical SIRET and meta.siretAsString', async () => {

        let db = await getTestDatabase();
        let organisme = newOrganismeAccount({
            _id: 11111111111111,
            SIRET: 11111111111111,
            meta: {
                siretAsString: '11111111111111'
            },
        });
        delete organisme.siret;
        await insertIntoDatabase('accounts', organisme);

        let stats = await cleanSiretProperties(db);

        assert.deepStrictEqual(stats, { updated: 1 });
        let updated = await db.collection('accounts').findOne({ _id: 11111111111111 });
        assert.ok(!updated.SIRET);
        assert.ok(!updated.meta.siretAsString);
        assert.strictEqual(updated.siret, '11111111111111');
    });

    it('should santize siret', async () => {

        let db = await getTestDatabase();
        let organisme = newOrganismeAccount({
            _id: 111111111,
            SIRET: 111111111,
            meta: {
                siretAsString: '00000111111111'
            },
        });
        delete organisme.siret;
        await insertIntoDatabase('accounts', organisme);

        let stats = await cleanSiretProperties(db);

        assert.deepStrictEqual(stats, { updated: 1 });
        let updated = await db.collection('accounts').findOne({ _id: 111111111 });
        assert.strictEqual(updated.siret, '111111111');
    });

}));
