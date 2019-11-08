const configuration = require('config');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const AccountMailer = require('../../../../../../src/jobs/mailing/organismes/account/AccountMailer');
const fakeMailer = require('../../../../../helpers/components/fake-mailer');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    let dummyAction = {
        getQuery: () => ({}),
    };

    it('should send email by siret', async () => {

        let db = await getTestDatabase();
        let mailer = fakeMailer();
        let id = 31705038300064;
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: id,
                SIRET: id,
                courriel: 'new@organisme.fr',
                score: {
                    nb_avis: 1,
                },
                meta: {
                    siretAsString: `${id}`,
                },
            })),
        ]);

        let accountMailer = new AccountMailer(db, logger, configuration, mailer);
        let results = await accountMailer.sendEmailBySiret('31705038300064');

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

    it('should send emails', async () => {

        let db = await getTestDatabase();
        let mailer = fakeMailer();
        let accountMailer = new AccountMailer(db, logger, configuration, mailer);
        await insertIntoDatabase('accounts', newOrganismeAccount({ courriel: 'new@organisme.fr' }));

        let results = await accountMailer.sendEmails(dummyAction);

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

    it('should update organisme when mailer succeed', async () => {

        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, fakeMailer());
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
        let accountMailer = new AccountMailer(db, logger, configuration, fakeMailer());
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
        let accountMailer = new AccountMailer(db, logger, configuration, fakeMailer({ fail: true }));
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
