const assert = require('assert');
const _ = require('lodash');
const logger = require('../../../helpers/test-logger');
const { withMongoDB } = require('../../../helpers/test-database');
const { newComment } = require('../../../helpers/data/dataset');
const reconcile = require('../../../../src/jobs/reconciliation/tasks/reconcile');
const addReconciliationAvisMetadata = require('../../../../src/jobs/reconciliation/tasks/addReconciliationAvisMetadata');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, importIntercarif }) => {

    it('should add flag to avis reconciliable', async () => {

        let db = await getTestDatabase();
        let avisReconciliable = newComment({
            formacode: '22403',
            training: {
                formacode: '22403',
                certifInfo: {
                    id: '80735',
                },
                organisation: {
                    siret: '22222222222222',
                },
                place: {
                    postalCode: '75019',
                },
            }
        });

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', avisReconciliable),
        ]);
        await reconcile(db, logger, { actions: true });

        await addReconciliationAvisMetadata(db);

        let avis = await db.collection('comment').findOne();
        assert.ok(avis.meta.reconciliations);
        let reconciliation = avis.meta.reconciliations[0];
        assert.ok(reconciliation);
        assert.ok(reconciliation.date);
        assert.deepStrictEqual(_.omit(reconciliation, ['date']), {
            reconciliable: true,
            formation: false,
            action: true,
            session: false,
        });
    });

    it('should add flag to non avis reconciliable', async () => {

        let db = await getTestDatabase();
        let avisNonReconciliable = newComment({
            training: {
                organisation: {
                    siret: '22222222222222',
                },
            }
        });

        await Promise.all([
            importIntercarif(),
            insertIntoDatabase('comment', avisNonReconciliable),
        ]);
        await reconcile(db, logger, { actions: true });

        await addReconciliationAvisMetadata(db);

        let avis = await db.collection('comment').findOne();
        assert.deepStrictEqual(_.omit(avis.meta.reconciliation, ['date']), {
            reconciliable: false,
            formation: false,
            action: false,
            session: false,
        });
        assert.ok(avis.meta.reconciliations);
        let lastReconciliation = avis.meta.reconciliations[0];
        assert.ok(lastReconciliation);
        assert.ok(lastReconciliation.date);
        assert.deepStrictEqual(_.omit(lastReconciliation, ['date']), {
            reconciliable: false,
            formation: false,
            action: false,
            session: false,
        });
    });

}));
