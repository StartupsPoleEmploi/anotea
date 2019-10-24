const configuration = require('config');
const _ = require('lodash');
const moment = require('moment');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newComment, newOrganismeAccount } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const NotificationMailer = require('../../../../../../src/jobs/mailing/organismes/notifications/NotificationMailer');

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
        let notificationMailer = new NotificationMailer(db, logger, configuration, fakeMailer(spy));
        await Promise.all([
            ...(
                _.range(5).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        read: false,
                        status: 'validated',
                        training: {
                            organisation: {
                                siret: `${31705038300064}`,
                            },
                        }
                    }));
                })
            ),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                score: {
                    nb_avis: 5,
                },
                meta: {
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await notificationMailer.sendEmails();

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(spy, [{
            to: 'new@organisme.fr'
        }]);
        let organisme = await db.collection('accounts').findOne({ _id: 31705038300064 });
        assert.ok(organisme.newCommentsNotificationEmailSentDate);
    });

    it('should send another email notification to organisme when not email sent since 30 days', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let notificationMailer = new NotificationMailer(db, logger, configuration, fakeMailer(spy));
        let newCommentsNotificationEmailSentDate = moment().subtract('45', 'days').toDate();
        await Promise.all([
            ...(
                _.range(5).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        read: false,
                        status: 'validated',
                        training: {
                            organisation: {
                                siret: `${31705038300064}`,
                            },
                        }
                    }));
                })
            ),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                newCommentsNotificationEmailSentDate: newCommentsNotificationEmailSentDate,
                score: {
                    nb_avis: 5,
                },
                meta: {
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await notificationMailer.sendEmails();

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(spy, [{
            to: 'new@organisme.fr'
        }]);
        let organisme = await db.collection('accounts').findOne({ _id: 31705038300064 });
        assert.ok(moment(organisme.newCommentsNotificationEmailSentDate).isAfter(newCommentsNotificationEmailSentDate));
    });

    it('should ignore organisme with less than 5 comments', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let notificationMailer = new NotificationMailer(db, logger, configuration, fakeMailer(spy));
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                score: {
                    nb_avis: 2,
                },
                meta: {
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await notificationMailer.sendEmails();

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });

    it('should ignore organisme with less than 5 comments not read yet', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let notificationMailer = new NotificationMailer(db, logger, configuration, fakeMailer(spy));
        await Promise.all([
            ...(
                _.range(2).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        read: false,
                        status: 'validated',
                        training: {
                            organisation: {
                                siret: `${31705038300064}`,
                            },
                        }
                    }));
                })
            ),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                score: {
                    nb_avis: 5,
                },
                meta: {
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await notificationMailer.sendEmails();

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });

    it('should ignore organisme when an email has been sent since less than 15 days', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let notificationMailer = new NotificationMailer(db, logger, configuration, fakeMailer(spy));
        await Promise.all([
            ...(
                _.range(5).map(() => {
                    return insertIntoDatabase('comment', newComment({
                        read: false,
                        status: 'validated',
                        training: {
                            organisation: {
                                siret: `${31705038300064}`,
                            },
                        }
                    }));
                })
            ),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                newCommentsNotificationEmailSentDate: moment().subtract('3', 'days'),
                courriel: 'new@organisme.fr',
                score: {
                    nb_avis: 5,
                },
                meta: {
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let results = await notificationMailer.sendEmails();

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });
}));
