const assert = require('assert');
const _ = require('lodash');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const { newTrainee, newComment } = require('../../../helpers/data/dataset');
const patchCertifInfos = require('../../../../src/jobs/patch/certifInfos/tasks/refreshCertifInfos');
const logger = require('../../../helpers/components/fake-logger');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, getTestFile }) => {

    it('should update certifinfos (stagiaire)', async () => {

        let db = await getTestDatabase();
        let certifinfosFile = getTestFile('certifinfos.csv');
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfos: ['10013'],
            },
            meta: {
                history: [{ date: new Date(), value: 'something changed' }]
            }
        }));

        let stats = await patchCertifInfos(db, logger, certifinfosFile);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.strictEqual(avis.training.certifInfos[0], '74037');

        //History
        assert.strictEqual(avis.meta.history.length, 2);
        assert.ok(avis.meta.history[0].date);
        assert.deepStrictEqual(_.omit(avis.meta.history[0], ['date']), {
            training: {
                certifInfos: ['10013'],
            },
        });

        //Stats
        assert.deepStrictEqual(stats, {
            trainee: {
                updated: 1,
                invalid: 0,
                total: 1,
            },
            comment: {
                updated: 0,
                invalid: 0,
                total: 0,
            }
        });
    });

    it('should update certifinfos (avis)', async () => {

        let db = await getTestDatabase();
        let certifinfosFile = getTestFile('certifinfos.csv');
        await insertIntoDatabase('comment', newComment({
            _id: '1234',
            training: {
                certifInfos: ['10013'],
            },
            meta: {
                history: [{ date: new Date(), value: 'something changed' }]
            }
        }));

        let stats = await patchCertifInfos(db, logger, certifinfosFile);

        let avis = await db.collection('comment').findOne({ _id: '1234' });
        assert.strictEqual(avis.training.certifInfos[0], '74037');

        //History
        assert.strictEqual(avis.meta.history.length, 2);
        assert.ok(avis.meta.history[0].date);
        assert.deepStrictEqual(_.omit(avis.meta.history[0], ['date']), {
            training: {
                certifInfos: ['10013'],
            },
        });

        //Stats
        assert.deepStrictEqual(stats, {
            trainee: {
                updated: 0,
                invalid: 0,
                total: 0,
            },
            comment: {
                updated: 1,
                invalid: 0,
                total: 1,
            }
        });
    });

    it('should update certifinfos (N to 1)', async () => {

        let db = await getTestDatabase();
        let certifinfosFile = getTestFile('certifinfos-Nto1.csv');
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfos: ['66587'],
            },
        }));

        await patchCertifInfos(db, logger, certifinfosFile);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.strictEqual(avis.training.certifInfos[0], '62229');
    });

    it('should update certifinfos (chaine)', async () => {

        let db = await getTestDatabase();
        let certifinfosFile = getTestFile('certifinfos-chaine.csv');
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfos: ['44496'],
            },
        }));

        await patchCertifInfos(db, logger, certifinfosFile);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.strictEqual(avis.training.certifInfos[0], '99999');
    });

    it('should ignore up to date certifinfos', async () => {

        let db = await getTestDatabase();
        let certifinfosFile = getTestFile('certifinfos.csv');
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfos: ['74037'],
            },
        }));

        let stats = await patchCertifInfos(db, logger, certifinfosFile);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfos[0], '74037');
        assert.deepStrictEqual(stats.trainee, {
            updated: 0,
            invalid: 0,
            total: 1,
        });
    });

    it('should ignore unknown certifinfos', async () => {

        let db = await getTestDatabase();
        let certifinfosFile = getTestFile('certifinfos.csv');
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfos: ['XXXXX'],
            },
        }));

        await patchCertifInfos(db, logger, certifinfosFile);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfos[0], 'XXXXX');
    });

}));
