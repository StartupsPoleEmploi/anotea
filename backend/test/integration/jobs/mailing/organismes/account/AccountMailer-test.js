const configuration = require('config');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const AccountMailer = require('../../../../../../src/jobs/mailing/organismes/account/AccountMailer');
const organismeAccountActivationEmail = require('../../../../../../src/common/components/emails/organismeAccountActivationEmail');
const fakeMailer = require('../../../../../helpers/components/fake-mailer');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, getComponents }) => {

    let dummyAction = {
        getQuery: () => ({}),
    };

    let createAccountMailer = async mailer => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();

        let email = organismeAccountActivationEmail(db, mailer, configuration, regions);
        return new AccountMailer(db, logger, email);
    };

    it('should send email by siret', async () => {

        let mailer = fakeMailer();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                score: {
                    nb_avis: 1,
                },
                meta: {
                    siretAsString: `${31705038300064}`,
                },
            })),
        ]);

        let accountMailer = await createAccountMailer(mailer);
        let results = await accountMailer.sendEmailBySiret('31705038300064');

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.strictEqual(mailer.getLastEmailAddress(), 'new@organisme.fr');
    });

    it('should send emails', async () => {

        let mailer = fakeMailer();
        let accountMailer = await createAccountMailer(mailer);
        await insertIntoDatabase('accounts', newOrganismeAccount({ courriel: 'new@organisme.fr' }));

        let results = await accountMailer.sendEmails(dummyAction);

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.strictEqual(mailer.getLastEmailAddress(), 'new@organisme.fr');
    });

    it('should update organisme when mailer succeed', async () => {

        let db = await getTestDatabase();
        let accountMailer = await createAccountMailer(fakeMailer());
        await insertIntoDatabase('accounts', newOrganismeAccount({
            courriel: 'new@organisme.fr',
            mailSentDate: null
        }));

        await accountMailer.sendEmails(dummyAction);

        let organisme = await db.collection('accounts').findOne({ courriel: 'new@organisme.fr' });
        assert.ok(organisme.mailSentDate);
        assert.deepStrictEqual(organisme.resend, false);
        assert.deepStrictEqual(organisme.mailError, undefined);
        assert.deepStrictEqual(organisme.mailErrorDetail, undefined);
    });

    it('should update set resend property to true on resend', async () => {

        let db = await getTestDatabase();
        let accountMailer = await createAccountMailer(fakeMailer());
        await insertIntoDatabase('accounts', newOrganismeAccount({
            courriel: 'new@organisme.fr',
            mailSentDate: new Date()
        }));

        await accountMailer.sendEmails(dummyAction);

        let organisme = await db.collection('accounts').findOne({ courriel: 'new@organisme.fr' });
        assert.deepStrictEqual(organisme.resend, true);
    });


    it('should update organisme when mailer fails', async () => {

        let db = await getTestDatabase();
        let accountMailer = await createAccountMailer(fakeMailer({ fail: true }));
        await insertIntoDatabase('accounts', newOrganismeAccount({ courriel: 'new@organisme.fr' }));

        try {
            await accountMailer.sendEmails(dummyAction);
            assert.fail();
        } catch (e) {
            let organisme = await db.collection('accounts').findOne({ courriel: 'new@organisme.fr' });
            assert.deepStrictEqual(organisme.mailError, 'smtpError');
            assert.deepStrictEqual(organisme.mailErrorDetail, 'Unable to send email');
        }
    });
}));
