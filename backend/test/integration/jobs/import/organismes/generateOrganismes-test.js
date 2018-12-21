const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const generateOrganismes = require('../../../../../lib/jobs/import/organismes/generateOrganismes');

describe(__filename, withMongoDB(({ getTestDatabase, insertDepartements, importIntercarif }) => {

    it('should generate organismes collections', async () => {

        let db = await getTestDatabase();
        let csvFile = path.join(__dirname, '../../../../helpers/data', 'kairos-organismes.csv');
        await Promise.all([importIntercarif(), insertDepartements()]);

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
