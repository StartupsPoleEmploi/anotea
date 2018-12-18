const configuration = require('config');
const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newOrganismeAccount } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/test-logger');
const AccountMailer = require('../../../../../../lib/jobs/mailing/organismes/account/AccountMailer');
const { successMailer, errorMailer } = require('../../fake-mailers');


describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    let dummyAction = {
        getQuery: () => ({}),
    };

    it('should send email by siret', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = 31705038300064;
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
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

        let accountMailer = new AccountMailer(db, logger, configuration, successMailer(emailsSent));
        let results = await accountMailer.sendEmailBySiret('31705038300064');

        assert.deepEqual(results, { mailSent: 1 });
        assert.deepEqual(emailsSent, [{
            to: 'new@organisme.fr'
        }]);
    });

    it('should send emails', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, successMailer(emailsSent));
        await insertIntoDatabase('organismes', newOrganismeAccount({ courriel: 'new@organisme.fr' }));

        let results = await accountMailer.sendEmails(dummyAction);

        assert.deepEqual(results, { mailSent: 1 });
        assert.deepEqual(emailsSent, [{
            to: 'new@organisme.fr'
        }]);
    });

    it('should update organisme when mailer succeed', async () => {

        let db = await getTestDatabase();
        let emailsSent = [];
        let accountMailer = new AccountMailer(db, logger, configuration, successMailer(emailsSent));
        await insertIntoDatabase('organismes', newOrganismeAccount({
            courriel: 'new@organisme.fr',
            mailSentDate: null
        }));

        await accountMailer.sendEmails(dummyAction);

        let organisme = await db.collection('organismes').findOne({ courriel: 'new@organisme.fr' });
        assert.ok(organisme.mailSentDate);
        assert.deepEqual(organisme.resend, false);
        assert.deepEqual(organisme.mailError, undefined);
        assert.deepEqual(organisme.mailErrorDetail, undefined);
    });

    it('should update set resend property to true on resend', async () => {

        let db = await getTestDatabase();
        let emailsSent = [];
        let accountMailer = new AccountMailer(db, logger, configuration, successMailer(emailsSent));
        await insertIntoDatabase('organismes', newOrganismeAccount({
            courriel: 'new@organisme.fr',
            mailSentDate: new Date()
        }));

        await accountMailer.sendEmails(dummyAction);

        let organisme = await db.collection('organismes').findOne({ courriel: 'new@organisme.fr' });
        assert.deepEqual(organisme.resend, true);
    });


    it('should update organisme when mailer fails', async () => {

        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, errorMailer());
        await insertIntoDatabase('organismes', newOrganismeAccount({ courriel: 'new@organisme.fr' }));

        try {
            await accountMailer.sendEmails(dummyAction);
            assert.fail();
        } catch (e) {
            let organisme = await db.collection('organismes').findOne({ courriel: 'new@organisme.fr' });
            assert.deepEqual(organisme.mailError, 'smtpError');
            assert.deepEqual(organisme.mailErrorDetail, 'timeout');
        }
    });
}));
