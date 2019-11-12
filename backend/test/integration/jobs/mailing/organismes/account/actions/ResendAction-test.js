const configuration = require('config');
const assert = require('assert');
const moment = require('moment');
const { withMongoDB } = require('../../../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../../../helpers/data/dataset');
const logger = require('../../../../../../helpers/components/fake-logger');
const fakeMailer = require('../../../../../../helpers/components/fake-mailer');
const AccountMailer = require('../../../../../../../src/jobs/mailing/organismes/account/AccountMailer');
const ResendAction = require('../../../../../../../src/jobs/mailing/organismes/account/actions/ResendAction');
const organismeAccountEmail = require('../../../../../../../src/common/components/emails/organismeAccountEmail');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, getComponents }) => {

    let createAccountMailer = async mailer => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();

        let email = organismeAccountEmail(db, mailer, configuration, regions);
        return new AccountMailer(db, logger, email);
    };

    it('should ignore organisme with email already resent', async () => {

        let mailer = fakeMailer();
        let accountMailer = await createAccountMailer(mailer);
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

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.strictEqual(mailer.getLastEmailAddress(), 'new@organisme.fr');
    });

    it('should ignore organisme with sent date lesser than relaunch delay', async () => {

        let accountMailer = await createAccountMailer(fakeMailer());
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

        let accountMailer = await createAccountMailer(fakeMailer());
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
