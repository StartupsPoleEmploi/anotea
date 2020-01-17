const assert = require('assert');
const _ = require('lodash');
const logger = require('../../../helpers/components/fake-logger');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const { newAvis } = require('../../../helpers/data/dataset');
const reconcile = require('../../../../src/jobs/reconciliation/tasks/reconcile');
const addReconciliationAvisMetadata = require('../../../../src/jobs/reconciliation/tasks/addReconciliationAvisMetadata');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should insert meta to avis reconciliable', async () => {

        let db = await getTestDatabase();
        let avisReconciliable = newAvis({
            training: {
                formacodes: ['22252'],
                certifInfos: ['80735'],
                organisation: {
                    siret: '22222222222222',
                },
                place: {
                    postalCode: '75019',
                },
            },
            meta: {
                reconciliations: [{
                    reconciliable: false,
                }]
            }
        });

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', avisReconciliable),
        ]);
        await reconcile(db, logger);

        await addReconciliationAvisMetadata(db);

        let avis = await db.collection('avis').findOne();
        assert.strictEqual(avis.meta.reconciliations.length, 2);
        assert.deepStrictEqual(_.omit(avis.meta.reconciliations[0], ['date']), {
            reconciliable: true,
        });
    });

    it('should create meta to avis non reconciliable', async () => {

        let db = await getTestDatabase();
        let avisNonReconciliable = newAvis({
            training: {
                organisation: {
                    siret: '22222222222222',
                },
            }
        });

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('avis', avisNonReconciliable),
        ]);
        await reconcile(db, logger);

        await addReconciliationAvisMetadata(db);

        let avis = await db.collection('avis').findOne();
        assert.strictEqual(avis.meta.reconciliations.length, 1);
        assert.deepStrictEqual(_.omit(avis.meta.reconciliations[0], ['date']), {
            reconciliable: false,
        });
    });

}));
