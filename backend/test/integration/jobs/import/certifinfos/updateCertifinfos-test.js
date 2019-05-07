const assert = require('assert');
const path = require('path');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const updateCertifinfos = require('../../../../../src/jobs/import/certifinfos/updateCertifinfos');
const logger = require('../../../../helpers/test-logger');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    let certifinfos = path.join(__dirname, '../../../../helpers/data', 'certifinfos.csv');

    it('should update certifinfos', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            _id: '1234',
            training: {
                certifInfo: {
                    id: '10013',
                },
            },
        }));

        let stats = await updateCertifinfos(db, logger, certifinfos);

        let avis = await db.collection('comment').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfo.id, '74037');
        assert.deepStrictEqual(avis.meta.originalCertifInfo, '10013');
        assert.deepStrictEqual(stats, {
            updated: 1,
            invalid: 0,
            total: 1,
        });
    });

    it('should ignore up to date certifinfos', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            _id: '1234',
            training: {
                certifInfo: {
                    id: '74037',
                },
            },
        }));

        let stats = await updateCertifinfos(db, logger, certifinfos);

        let avis = await db.collection('comment').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfo.id, '74037');
        assert.deepStrictEqual(stats, {
            updated: 0,
            invalid: 0,
            total: 1,
        });
    });

    it('should ignore unknown certifinfos', async () => {

        let db = await getTestDatabase();
        await insertIntoDatabase('comment', newComment({
            _id: '1234',
            training: {
                certifInfo: {
                    id: 'XXXXX',
                },
            },
        }));

        await updateCertifinfos(db, logger, certifinfos);

        let avis = await db.collection('comment').findOne({ _id: '1234' });
        assert.deepStrictEqual(avis.training.certifInfo.id, 'XXXXX');
    });

}));
