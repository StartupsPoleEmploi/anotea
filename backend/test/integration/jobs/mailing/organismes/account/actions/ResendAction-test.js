const configuration = require('config');
const assert = require('assert');
const moment = require('moment');
const { withMongoDB } = require('../../../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../../../helpers/data/dataset');
const logger = require('../../../../../../helpers/components/fake-logger');
const fakeMailer = require('../../../../../../helpers/components/fake-mailer');
const AccountMailer = require('../../../../../../../src/jobs/mailing/organismes/account/AccountMailer');
const ResendAction = require('../../../../../../../src/jobs/mailing/organismes/account/actions/ResendAction');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should ignore organisme with email already resent', async () => {

        let db = await getTestDatabase();
        let mailer = fakeMailer();
        let accountMailer = new AccountMailer(db, logger, configuration, mailer);
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    siretAsString: `${31705038300064}`,
                },
                passwordHash: null,
                mailSentDate: moment().subtract('40', 'days').toDate(),
                sources: ['intercarif'],
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111,
                SIRET: 11111111111,
                courriel: 'not-sent@organisme.fr',
                meta: {
                    siretAsString: `11111111111`,
                },
                passwordHash: '12345',
                mailSentDate: null,
                sources: ['intercarif'],
            })),
        ]);

        let results = await accountMailer.sendEmails(action);

        let emailSent = mailer.getLastEmailSent();
        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(emailSent[0], {
            to: 'new@organisme.fr'
        });
    });

    it('should ignore organisme with sent date lesser than relaunch delay', async () => {

        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, fakeMailer());
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111,
                SIRET: 11111111111,
                courriel: 'not-sent@organisme.fr',
                meta: {
                    siretAsString: `11111111111`,
                },
                passwordHash: '12345',
                mailSentDate: moment().subtract('1', 'days').toDate(),
                sources: ['intercarif'],
            })),
        ]);

        let results = await accountMailer.sendEmails(action);

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });

    it('should ignore organisme with password already set', async () => {

        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, fakeMailer());
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    siretAsString: `${31705038300064}`,
                },
                passwordHash: '12345',
                mailSentDate: moment().subtract('40', 'days').toDate(),
                sources: ['intercarif'],
            })),
        ]);

        let results = await accountMailer.sendEmails(action);

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });

}));
