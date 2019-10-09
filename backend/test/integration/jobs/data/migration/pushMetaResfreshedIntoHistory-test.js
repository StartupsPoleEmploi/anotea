const assert = require('assert');
const moment = require('moment');
const { withMongoDB } = require('../../../../helpers/test-database');
const { newComment } = require('../../../../helpers/data/dataset');
const pushMetaResfreshedIntoHistory = require('../../../../../src/jobs/data/migration/tasks/pushMetaResfreshedIntoHistory');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('déplace meta.refreshed dans meta.history', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            meta: {
                refreshed: [
                    {
                        diff: {
                            training: {
                                place: {
                                    inseeCode: null
                                }
                            }
                        },
                        date,
                    }
                ],
            },
        }));

        await pushMetaResfreshedIntoHistory(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(doc.meta.refreshed === undefined);
        assert.deepStrictEqual(doc.meta.history, [{
            date,
            training: {
                place: {
                    inseeCode: null
                }
            }
        }]);
    });

    it('préserve meta.history et son ordre lors du déplacement', async () => {

        let db = await getTestDatabase();
        let now = new Date();
        let before = moment(now).subtract(7, 'days').toDate();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            meta: {
                history: [{ date: before }],
                refreshed: [
                    {
                        diff: {
                            training: {
                                place: {
                                    inseeCode: null
                                }
                            }
                        },
                        date: now,
                    }
                ],
            },
        }));

        await pushMetaResfreshedIntoHistory(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.ok(doc.meta.refreshed === undefined);
        assert.deepStrictEqual(doc.meta.history, [
            {
                date: now,
                training: {
                    place: {
                        inseeCode: null
                    }
                }
            },
            { date: before },
        ]);
    });

}));
