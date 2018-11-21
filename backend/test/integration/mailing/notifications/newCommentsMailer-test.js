const configuration = require('config');
const _ = require('lodash');
const assert = require('assert');
const { withMongoDB } = require('../../../helpers/test-db');
const { newComment, newOrganismeAccount } = require('../../../helpers/data/dataset');
const logger = require('../../../helpers/test-logger');
const newCommentsMailer = require('../../../../jobs/mailing/notifications/newCommentsMailer');

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
        let { sendEmails } = newCommentsMailer(db, logger, configuration, fakeMailer(spy));
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

        let results = await sendEmails();

        assert.deepEqual(results, { mailSent: 1 });
        assert.deepEqual(spy, [{
            to: 'new@organisme.fr'
        }]);
    });

    it('should ignore organisme when less than 5 not yet read comments', async () => {

        let spy = [];
        let db = await getTestDatabase();
        let { sendEmails } = newCommentsMailer(db, logger, configuration, fakeMailer(spy));
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

        let results = await sendEmails();

        assert.deepEqual(results, { mailSent: 0 });
    });
}));
