const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const importTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/importTrainee');
const refreshTrainee = require('../../../../../src/jobs/import/stagiaires/tasks/refreshTrainee');
const poleEmploiCSVHandler = require('../../../../../src/jobs/import/stagiaires/tasks/handlers/poleEmploiCSVHandler');

describe(__filename, withMongoDB(({ getTestDatabase, getComponents, getTestFile, insertIntoDatabase }) => {

    it('should update inseeCode in trainee', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let previous = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });

        await refreshTrainee(db, logger, getTestFile('stagiaires-pe-new-insee.csv'), handler);

        let next = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        assert.deepStrictEqual(next.training.place.inseeCode, '99999');
        assert.deepStrictEqual(next.meta.refreshed.length, 1);
        delete previous.training.place.inseeCode;
        delete next.training.place.inseeCode;
        delete next.meta;
        assert.deepStrictEqual(previous, next);
    });

    it('should update inseeCode in comment', async () => {

        let db = await getTestDatabase();
        let { regions } = await getComponents();
        let handler = poleEmploiCSVHandler(db, regions);

        await importTrainee(db, logger, getTestFile('stagiaires-pe.csv'), handler);
        let previous = await db.collection('trainee').findOne({ 'trainee.email': 'email_1@pe.com' });
        await insertIntoDatabase('comment', newComment({
            token: previous.token,
        }));

        await refreshTrainee(db, logger, getTestFile('stagiaires-pe-new-insee.csv'), handler);

        let next = await db.collection('comment').findOne({ token: previous.token });
        assert.deepStrictEqual(next.training.place.inseeCode, '99999');
    });
}));
