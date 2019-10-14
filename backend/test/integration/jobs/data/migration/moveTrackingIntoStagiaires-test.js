const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const logger = require('../../../../helpers/fake-logger');
const { newTrainee, newComment } = require('../../../../helpers/data/dataset');
const moveTrackingIntoStagiaires = require('../../../../../src/jobs/data/migration/tasks/moveTrackingIntoStagiaires');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('déplace tracking.clickLink dans stagiaire.tracking.clickLinks', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                token: '123',
                tracking: {
                    firstRead: date
                },
            })),
            insertIntoDatabase('comment', newComment({
                token: '123',
                tracking: {
                    lastRead: date,
                    clickLink: [
                        {
                            'date': date,
                            'goto': 'lbb'
                        },
                        {
                            'date': date,
                            'goto': 'pe'
                        },
                        {
                            'date': date,
                            'goto': 'clara'
                        }
                    ],
                }
            })),
        ]);

        let stats = await moveTrackingIntoStagiaires(db, logger);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(doc.tracking === undefined);

        doc = await db.collection('trainee').findOne({ token: '123' });
        assert.deepStrictEqual(doc.tracking, {
            clickLinks: [
                {
                    date: date,
                    goto: 'lbb'
                },
                {
                    date: date,
                    goto: 'pe'
                },
                {
                    date: date,
                    goto: 'clara'
                }
            ],
            firstRead: date
        });
        assert.deepStrictEqual(stats, {
            updated: 1,
        });
    });

    it('supprime tracking dans comment', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                token: '123',
                tracking: {
                    firstRead: date
                },
            })),
            insertIntoDatabase('comment', newComment({
                token: '123',
                tracking: {
                    lastRead: date
                }
            })),
        ]);

        await moveTrackingIntoStagiaires(db, logger);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(doc.tracking === undefined);

        doc = await db.collection('trainee').findOne({ token: '123' });
        assert.deepStrictEqual(doc.tracking, {
            firstRead: date
        });
    });
}));
