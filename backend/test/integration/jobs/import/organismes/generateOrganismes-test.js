const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-db');
const logger = require('../../../../helpers/test-logger');
const generateOrganismes = require('../../../../../lib/jobs/import/organismes/generateOrganismes');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should generate organismes collections', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');
        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('departements', {
                region: 'Ile De France',
                dept_num: '75',
                region_num: '11',
                codeFinanceur: '2'
            }),
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
        ]);

        let results = await generateOrganismes(db, logger, csvFile);

        assert.deepEqual(results, {
            intercarif: {
                responsable: 1,
                formateurs: 1,
            },
            kairos: {
                inserted: 3,
                invalid: 0
            }
        });
        assert.deepEqual(await db.collection('intercarif_organismes_responsables').countDocuments(), 1);
        assert.deepEqual(await db.collection('intercarif_organismes_formateurs').countDocuments(), 1);
        assert.deepEqual(await db.collection('kairos_organismes').countDocuments(), 3);
    });

}));
