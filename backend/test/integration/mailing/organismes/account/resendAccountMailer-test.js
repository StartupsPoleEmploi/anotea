const configuration = require('config');
const moment = require('moment');
const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newComment, newOrganismeAccount } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const resendAccountMailer = require('../../../../../jobs/mailing/organismes/account/resendAccountMailer');

let fakeMailer = spy => {
    return {
        sendOrganisationAccountLink: async (options, organisme, callback) => {
            await callback();
            spy.push(options);
        }
    };
};

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should resend email', async () => {

        let spy = [];
        let db = await getTestDatabase();

        await Promise.all([
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `${31705038300064}`,
                    },
                }
            })),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `${31705038300064}`,
                },
                passwordHash: null,
                mailSentDate: moment().subtract('10', 'days').toDate(),
            })),
        ]);

        let { resendEmails } = resendAccountMailer(db, logger, configuration, fakeMailer(spy));
        let results = await resendEmails();

        assert.deepEqual(results, { mailSent: 1 });
        assert.deepEqual(spy, [{
            to: 'new@organisme.fr'
        }]);
    });

    it('should ignore organisme with sent date lesser than relaunch delay', async () => {

        let spy = [];
        let db = await getTestDatabase();

        await Promise.all([
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `${31705038300064}`,
                    },
                }
            })),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `${31705038300064}`,
                },
                passwordHash: null,
                mailSentDate: moment().subtract('1', 'days').toDate(),
            })),
        ]);

        let { resendEmails } = resendAccountMailer(db, logger, configuration, fakeMailer(spy));
        let results = await resendEmails();

        assert.deepEqual(results, { mailSent: 0 });
    });

    it('should ignore organisme with email already resent', async () => {

        let spy = [];
        let db = await getTestDatabase();

        await Promise.all([
            insertIntoDatabase('comment', newComment({
                training: {
                    organisation: {
                        siret: `${31705038300064}`,
                    },
                }
            })),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `${31705038300064}`,
                },
                passwordHash: null,
                resend: true,
                mailSentDate: moment().subtract('20', 'days').toDate(),
            })),
        ]);

        let { resendEmails } = resendAccountMailer(db, logger, configuration, fakeMailer(spy));
        let results = await resendEmails();

        assert.deepEqual(results, { mailSent: 0 });
    });
}));
