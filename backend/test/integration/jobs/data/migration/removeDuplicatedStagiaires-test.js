const moment = require('moment');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-database');
const logger = require('../../../../helpers/test-logger');
const { newTrainee, newComment } = require('../../../../helpers/data/dataset');
const removeDuplicatedStagiaires = require('../../../../../src/jobs/data/migration/tasks/removeDuplicatedStagiaires');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('suppression des doublons sans avis (on conserve le plus récent)', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                token: '123',
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: moment(date).add(7, 'days').toDate(),
                }
            })),
            insertIntoDatabase('trainee', newTrainee({
                token: '456',
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: date,
                }
            })),
        ]);

        let stats = await removeDuplicatedStagiaires(db, logger);

        assert.strictEqual(await db.collection('trainee').count({ token: '123' }), 1);
        assert.strictEqual(await db.collection('trainee').count({ token: '456' }), 0);
        assert.deepStrictEqual(stats, {
            invalid: 0,
            preserved: 1,
            removed: 1,
            total: 2,
        });
    });

    it('suppression des doublons avec un avis', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                token: '123',
                avisCreated: true,
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: date,
                }
            })),
            insertIntoDatabase('trainee', newTrainee({
                token: '456',
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: moment(date).add(7, 'days').toDate(),
                }
            })),
            insertIntoDatabase('comment', newComment({
                token: '123',
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: date,
                }
            })),
        ]);

        let stats = await removeDuplicatedStagiaires(db, logger);

        assert.strictEqual(await db.collection('trainee').count({ token: '123' }), 1);
        assert.strictEqual(await db.collection('trainee').count({ token: '456' }), 0);
        assert.strictEqual(await db.collection('comment').count({ token: '123' }), 1);
        assert.deepStrictEqual(stats, {
            invalid: 0,
            preserved: 1,
            removed: 1,
            total: 2,
        });
    });

    it('suppression des doublons avec deux avis', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                token: '123',
                avisCreated: true,
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: date,
                }
            })),
            insertIntoDatabase('trainee', newTrainee({
                token: '456',
                avisCreated: true,
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: moment(date).add(7, 'days').toDate(),
                }
            })),
            insertIntoDatabase('comment', newComment({
                token: '123',
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: date,
                }
            })),
            insertIntoDatabase('comment', newComment({
                token: '456',
                trainee: {
                    email: 'toto@email.fr',
                    idSession: 'SE_XXXXXX',
                },
                training: {
                    scheduledEndDate: date,
                }
            })),
        ]);

        let stats = await removeDuplicatedStagiaires(db, logger);

        assert.strictEqual(await db.collection('trainee').count({ token: '123' }), 1);
        assert.strictEqual(await db.collection('trainee').count({ token: '456' }), 1);
        assert.strictEqual(await db.collection('comment').count({ token: '123' }), 1);
        assert.strictEqual(await db.collection('comment').count({ token: '456' }), 1);
        assert.deepStrictEqual(stats, {
            invalid: 0,
            preserved: 2,
            removed: 0,
            total: 2,
        });
    });
}));
