const assert = require('assert');
const configuration = require('config');
const moment = require('moment');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newOrganismeAccount } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const sendAccountActivationEmails = require('../../../../../../src/jobs/mailing/organismes/account/tasks/sendActivationCompteEmails');
const ForceAction = require('../../../../../../src/jobs/mailing/organismes/account/tasks/actions/ForceAction');
const SendAction = require('../../../../../../src/jobs/mailing/organismes/account/tasks/actions/SendAction');
const ResendAction = require('../../../../../../src/jobs/mailing/organismes/account/tasks/actions/ResendAction');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, createEmailMocks }) => {

    it('should send email by siret', async () => {

        let db = await getTestDatabase();
        let { emails, mailer } = await createEmailMocks();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '31705038300064',
                courriel: 'new@organisme.fr',
                score: {
                    nb_avis: 1,
                },
            })),
        ]);

        let results = await sendAccountActivationEmails(db, logger, emails, new ForceAction(), {
            siret: '31705038300064'
        });

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });

        let message = mailer.getEmailMessagesSent().pop();

        assert.strictEqual(message.email, 'new@organisme.fr');
        assert.strictEqual(message.parameters.subject, 'Pôle Emploi vous donne accès aux avis de vos stagiaires');
    });

    it('should send emails', async () => {

        let db = await getTestDatabase();
        let { emails, mailer } = await createEmailMocks();
        await insertIntoDatabase('accounts', newOrganismeAccount({ courriel: 'new@organisme.fr' }));

        let results = await sendAccountActivationEmails(db, logger, emails, new ForceAction());

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(mailer.getEmailAddresses(), ['new@organisme.fr']);
        let message = mailer.getEmailMessagesSent().pop();
        assert.strictEqual(message.parameters.subject, 'Pôle Emploi vous donne accès aux avis de vos stagiaires');
    });

    it('should update organisme when mailer succeed', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        await insertIntoDatabase('accounts', newOrganismeAccount({
            courriel: 'new@organisme.fr',
            mailSentDate: null
        }));

        await sendAccountActivationEmails(db, logger, emails, new ForceAction());

        let organisme = await db.collection('accounts').findOne({ courriel: 'new@organisme.fr' });
        assert.ok(organisme.mailSentDate);
        assert.deepStrictEqual(organisme.resend, false);
        assert.deepStrictEqual(organisme.mailError, undefined);
        assert.deepStrictEqual(organisme.mailErrorDetail, undefined);
    });

    it('should update set resend property to true on resend', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        await insertIntoDatabase('accounts', newOrganismeAccount({
            courriel: 'new@organisme.fr',
            mailSentDate: new Date()
        }));

        await sendAccountActivationEmails(db, logger, emails, new ForceAction());

        let organisme = await db.collection('accounts').findOne({ courriel: 'new@organisme.fr' });
        assert.deepStrictEqual(organisme.resend, true);
    });


    it('should update organisme when mailer fails', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks({ fail: true });
        await insertIntoDatabase('accounts', newOrganismeAccount({ courriel: 'new@organisme.fr' }));

        try {
            await sendAccountActivationEmails(db, logger, emails, new ForceAction());
            assert.fail();
        } catch (e) {
            let organisme = await db.collection('accounts').findOne({ courriel: 'new@organisme.fr' });
            assert.deepStrictEqual(organisme.mailError, 'smtpError');
            assert.deepStrictEqual(organisme.mailErrorDetail, 'Unable to send email');
        }
    });

    it('should send email to new organismes only (SendAction)', async () => {

        let db = await getTestDatabase();
        let { emails, mailer } = await createEmailMocks();
        let action = new SendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '31705038300064',
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 1,
                },
                passwordHash: null,
                mailSentDate: null,
                sources: ['intercarif'],
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                courriel: 'not-sent@organisme.fr',
                meta: {
                    nbAvis: 1,
                },
                passwordHash: '12345',
                mailSentDate: null,
                sources: ['intercarif'],
            })),
        ]);

        let results = await sendAccountActivationEmails(db, logger, emails, action);

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(mailer.getEmailAddresses(), ['new@organisme.fr']);
    });

    it('should send email only to organismes in active regions (SendAction)', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                courriel: 'not-sent@organisme.fr',
                meta: {
                    nbAvis: 1,
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
        let results = await sendAccountActivationEmails(db, logger, emails, action);

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });

    it('should ignore organisme with email already resent (ResendAction)', async () => {

        let db = await getTestDatabase();
        let { emails, mailer } = await createEmailMocks();
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '31705038300064',
                courriel: 'new@organisme.fr',
                passwordHash: null,
                mailSentDate: moment().subtract('40', 'days').toDate(),
                sources: ['intercarif'],
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                courriel: 'not-sent@organisme.fr',
                passwordHash: '12345',
                mailSentDate: null,
                sources: ['intercarif'],
            })),
        ]);

        let results = await sendAccountActivationEmails(db, logger, emails, action);

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(mailer.getEmailAddresses(), ['new@organisme.fr']);
    });

    it('should ignore organisme with sent date lesser than relaunch delay (ResendAction)', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '11111111111111',
                courriel: 'not-sent@organisme.fr',
                passwordHash: '12345',
                mailSentDate: moment().subtract('1', 'days').toDate(),
                sources: ['intercarif'],
            })),
        ]);

        let results = await sendAccountActivationEmails(db, logger, emails, action);

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });

    it('should ignore organisme with password already set (ResendAction)', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('accounts', newOrganismeAccount({
                siret: '31705038300064',
                courriel: 'new@organisme.fr',
                passwordHash: '12345',
                mailSentDate: moment().subtract('40', 'days').toDate(),
                sources: ['intercarif'],
            })),
        ]);

        let results = await sendAccountActivationEmails(db, logger, emails, action);

        assert.deepStrictEqual(results, {
            total: 0,
            sent: 0,
            error: 0,
        });
    });
}));
