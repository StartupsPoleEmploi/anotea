const configuration = require('config');
const assert = require('assert');
const { withMongoDB } = require('../../../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../../../helpers/data/dataset');
const logger = require('../../../../../../helpers/components/fake-logger');
const AccountMailer = require('../../../../../../../src/jobs/mailing/organismes/account/AccountMailer');
const SendAction = require('../../../../../../../src/jobs/mailing/organismes/account/actions/SendAction');
const fakeMailer = require('../../../../../../helpers/components/fake-mailer');
const organismeAccountEmail = require('../../../../../../../src/common/components/emails/organismeAccountEmail');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, getComponents }) => {

    let createAccountMailer = async mailer => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();

        let email = organismeAccountEmail(db, mailer, configuration, regions);
        return new AccountMailer(db, logger, email);
    };

    it('should send email to new organismes only', async () => {

        let mailer = fakeMailer();
        let id = 31705038300064;
        let accountMailer = await createAccountMailer(mailer);
        let action = new SendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: id,
                SIRET: id,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `${id}`,
                },
                passwordHash: null,
                mailSentDate: null,
                sources: ['intercarif'],
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111,
                SIRET: 11111111111,
                courriel: 'not-sent@organisme.fr',
                meta: {
                    nbAvis: 1,
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

    it('should send email only to organismes in active regions', async () => {

        let mailer = fakeMailer();
        let accountMailer = await createAccountMailer(mailer);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111,
                SIRET: 11111111111,
                courriel: 'not-sent@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `11111111111`,
                },
                passwordHash: null,
                mailSentDate: null,
                sources: ['intercarif'],
                codeRegion: 'XX',
            })),
        ]);

        let action = new SendAction(configuration, {
            codeRegions: ['11'],
        });
        let results = await accountMailer.sendEmails(action);

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });

}));
