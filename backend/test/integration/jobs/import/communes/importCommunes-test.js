const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const logger = require('../../../../helpers/components/fake-logger');
const importCommunes = require('../../../../../src/jobs/import/communes/tasks/importCommunes');

describe(__filename, withMongoDB(({ getTestDatabase, getTestFile, createIndexes }) => {

    const communesCsvFile = getTestFile('communes.csv');
    const cedexCsvFile = getTestFile('cedex.csv');

    it('should create commune', async () => {

        let db = await getTestDatabase();
        await createIndexes('communes');

        let stats = await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        let doc = await db.collection('communes').findOne({ inseeCode: '77130' });
        assert.deepStrictEqual(_.omit(doc, ['_id']), {
            inseeCode: '77130',
            postalCodes: ['77580'],
            nom: 'COULOMMES',
            cedex: []
        });

        let results = await db.collection('communes').find({ postalCodes: '78200' }).toArray();
        assert.strictEqual(results.length, 11);

        assert.deepStrictEqual(stats, {
            total: 17,
            created: 14,
            updated: 3,
            invalid: 0
        });
    });

    it('should create commune with cedex', async () => {

        let db = await getTestDatabase();
        await createIndexes('communes');

        await importCommunes(db, logger, communesCsvFile, cedexCsvFile);

        let doc = await db.collection('communes').findOne({ inseeCode: '44109' });
        assert.deepStrictEqual(_.omit(doc, ['_id']), {
            inseeCode: '44109',
            postalCodes: ['44200', '44300', '44000', '44100'],
            nom: 'NANTES',
            cedex: ['44186', '44339', '44081'],
        });
    });
}));
