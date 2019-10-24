const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../helpers/with-mongodb');
const { newTrainee } = require('../../../helpers/data/dataset');
const patchCertifInfos = require('../../../../src/jobs/patch/certifInfos/tasks/refreshCertifInfos');
const logger = require('../../../helpers/fake-logger');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    let certifinfos = path.join(__dirname, '../../../helpers/data', 'certifinfos.csv');

    it('should update certifinfos', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfo: {
                    id: '10013',
                },
            },
        }));

        let stats = await patchCertifInfos(db, logger, certifinfos);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfo.id, '74037');
        assert.deepStrictEqual(avis.meta.patch.certifInfo, '10013');
        assert.deepStrictEqual(stats, {
            updated: 1,
            invalid: 0,
            total: 1,
        });
    });

    it('should ignore up to date certifinfos', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfo: {
                    id: '74037',
                },
            },
        }));

        let stats = await patchCertifInfos(db, logger, certifinfos);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfo.id, '74037');
        assert.deepStrictEqual(stats, {
            updated: 0,
            invalid: 0,
            total: 1,
        });
    });

    it('should ignore unknown certifinfos', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('trainee', newTrainee({
            _id: '1234',
            training: {
                certifInfo: {
                    id: 'XXXXX',
                },
            },
        }));

        await patchCertifInfos(db, logger, certifinfos);

        let avis = await db.collection('trainee').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfo.id, 'XXXXX');
    });

}));
