const configuration = require('config');
const _ = require('lodash');
const moment = require('moment');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newComment, newOrganismeAccount } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const CommentsMailer = require('../../../../../jobs/mailing/organismes/notifications/CommentsMailer');

let fakeMailer = spy => {
    return {
        sendNewCommentsNotification: async (options, data, callback) => {
            await callback();
            spy.push(options);
        }
    };
};

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should send email notification to organisme when it as at least 5 not yet read comments', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let commentsMailer = new CommentsMailer(db, logger, configuration, fakeMailer(spy));
        await Promise.all([
            ...(
                _.range(5).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        read: false,
                        published: true,
                        training: {
                            organisation: {
                                siret: `${31705038300064}`,
                            },
                        }
                    }));
                })
            ),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 5,
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await commentsMailer.sendEmails();

        assert.deepEqual(results, { mailSent: 1 });
        assert.deepEqual(spy, [{
            to: 'new@organisme.fr'
        }]);
        let organisme = await db.collection('organismes').findOne({ _id: 31705038300064 });
        assert.ok(organisme.newCommentsNotificationEmailSentDate);
    });

    it('should send email notification to organisme when not email sent since 15 days', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let commentsMailer = new CommentsMailer(db, logger, configuration, fakeMailer(spy));
        let newCommentsNotificationEmailSentDate = moment().subtract('25', 'days').toDate();
        await Promise.all([
            ...(
                _.range(5).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        read: false,
                        published: true,
                        training: {
                            organisation: {
                                siret: `${31705038300064}`,
                            },
                        }
                    }));
                })
            ),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                newCommentsNotificationEmailSentDate: newCommentsNotificationEmailSentDate,
                meta: {
                    nbAvis: 5,
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await commentsMailer.sendEmails();

        assert.deepEqual(results, { mailSent: 1 });
        assert.deepEqual(spy, [{
            to: 'new@organisme.fr'
        }]);
        let organisme = await db.collection('organismes').findOne({ _id: 31705038300064 });
        assert.ok(moment(organisme.newCommentsNotificationEmailSentDate).isAfter(newCommentsNotificationEmailSentDate));
    });

    it('should ignore organisme when less than 5 not yet read comments', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let commentsMailer = new CommentsMailer(db, logger, configuration, fakeMailer(spy));
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 2,
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await commentsMailer.sendEmails();

        assert.deepEqual(results, { mailSent: 0 });
    });

    it('should ignore organisme when an email has been sent since less than 15 days', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let commentsMailer = new CommentsMailer(db, logger, configuration, fakeMailer(spy));
        await Promise.all([
            ...(
                _.range(5).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        read: false,
                        published: true,
                        training: {
                            organisation: {
                                siret: `${31705038300064}`,
                            },
                        }
                    }));
                })
            ),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                newCommentsNotificationEmailSentDate: moment().subtract('3', 'days'),
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 5,
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await commentsMailer.sendEmails();

        assert.deepEqual(results, { mailSent: 0 });
    });
}));
