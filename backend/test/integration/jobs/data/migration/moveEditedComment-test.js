const moment = require('moment');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const { newComment } = require('../../../../helpers/data/dataset');
const moveEditedCommentProperty = require('../../../../../src/jobs/data/migration/tasks/moveEditedCommentProperty');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase }) => {

    it('ajoute l\'ancien text dans meta.history', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            comment: {
                title: 'Génial',
                text: 'Ancien',
            },
            editedComment: {
                date,
                text: 'Nouveau',
            },
        }));

        await moveEditedCommentProperty(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.comment, {
            title: 'Génial',
            text: 'Nouveau',
        });
        assert.deepStrictEqual(doc.meta, {
            history: [{
                date,
                comment: {
                    text: 'Ancien',
                }
            }],
        });
    });

    it('insert en premier l\'ancien text dans meta.history', async () => {

        let db = await getTestDatabase();
        let date = new Date();
        await insertIntoDatabase('comment', newComment({
            token: '123',
            comment: {
                title: 'Génial',
                text: 'Ancien',
            },
            editedComment: {
                date,
                text: 'Nouveau',
            },
            meta: {
                history: [{ data: 1 }]
            }
        }));

        await moveEditedCommentProperty(db);

        let doc = await db.collection('comment').findOne({ token: '123' });
        assert.deepStrictEqual(doc.comment, {
            title: 'Génial',
            text: 'Nouveau',
        });
        assert.deepStrictEqual(doc.meta, {
            history: [
                {
                    date,
                    comment: {
                        text: 'Ancien',
                    }
                },
                { data: 1 }
            ],
        });
    });

}));
