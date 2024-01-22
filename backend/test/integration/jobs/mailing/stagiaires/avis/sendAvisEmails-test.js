const assert = require('assert');
const moment = require('moment');
const configuration = require('config');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newStagiaire, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const sendAvisEmails = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/sendAvisEmails');
const SendAction = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/SendAction');
const RetryAction = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/RetryAction');
const ResendAction = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/ResendAction');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, createEmailMocks }) => {

    let getDummyAction = (selector = {}) => {
        return {
            getQuery: () => selector,
        };
    };

    it('should send email to stagiaire (DummyAction)', async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize('name')}@email.fr`;
        let action = getDummyAction({ _id: '1234' });
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: '1234',
                individu: {
                    email: email,
                },
            })),
        ]);

        let results = await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        let emailMessagesSent = mailer.getEmailMessagesSent();
        assert.strictEqual(emailMessagesSent.length, 1);
        assert.strictEqual(emailMessagesSent[0].parameters.subject, 'France Travail vous demande votre avis sur votre formation');
        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });

    it('should update stagiaire when mailer succeed', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        let id = randomize('stagiaire');
        let action = getDummyAction();
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: id,
                individu: {
                    email: `${randomize('name')}@email.fr`,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        let stagiaire = await db.collection('stagiaires').findOne({ _id: id });
        assert.ok(stagiaire.mailSent);
        assert.ok(stagiaire.mailSentDate);
        assert.deepStrictEqual(stagiaire.mailError, undefined);
        assert.deepStrictEqual(stagiaire.mailErrorDetail, undefined);
        assert.deepStrictEqual(stagiaire.mailRetry, 0);
    });

    it('should increase maxRetry when an email has already been sent', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks();
        let id = randomize('stagiaire');
        let action = getDummyAction();
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: id,
                mailRetry: 0,
                individu: {
                    email: `${randomize('name')}@email.fr`,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        let stagiaire = await db.collection('stagiaires').findOne({ _id: id });
        assert.deepStrictEqual(stagiaire.mailRetry, 1);
    });

    it('should update stagiaire when mailer fails', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks({ fail: true });
        let id = randomize('stagiaire');
        let action = getDummyAction();
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: id,
                individu: {
                    email: `${randomize('name')}@email.fr`,
                },
            })),
        ]);

        try {
            await sendAvisEmails(db, logger, emails, action);
            assert.fail();
        } catch (e) {
            let stagiaire = await db.collection('stagiaires').findOne({ _id: id });
            assert.ok(stagiaire.mailSent);
            assert.deepStrictEqual(stagiaire.mailError, 'smtpError');
            assert.deepStrictEqual(stagiaire.mailErrorDetail, 'Unable to send email');
            assert.deepStrictEqual(e, {
                total: 1,
                sent: 0,
                error: 1,
            });
        }
    });

    it('should send email to new stagiaire (SendAction)', async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize('name')}@email.fr`;
        let action = new SendAction(configuration);
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: randomize('stagiaire'),
                codeRegion: '11',
                sourceIDF: null,
                mailSent: false,
                unsubscribe: false,
                individu: {
                    email: email,
                },
            })),
            insertIntoDatabase('stagiaires', newStagiaire({
                codeRegion: '11',
                sourceIDF: null,
                mailSent: false,
                unsubscribe: true,
                individu: {
                    email: 'not-sent@stagiaire.org',
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });

    it('should ignore region (SendAction', async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                codeRegion: 'XX',
                sourceIDF: null,
                mailSent: false,
                unsubscribe: false,
            })),
        ]);
        let action = new SendAction(configuration, {
            codeRegions: ['11']
        });

        await sendAvisEmails(db, logger, emails, action);

        assert.strictEqual(mailer.getEmailMessagesSent().length, 0);
    });

    it('should send email to stagiaire with smtp error (RetryAction)', async () => {

        let db = await getTestDatabase();
        let id = randomize('stagiaire');
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize('name')}@email.fr`;
        let action = new RetryAction(configuration);
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: id,
                codeRegion: '93',
                mailSent: true,
                unsubscribe: false,
                mailError: 'smtpError',
                mailErrorDetail: 'An error occurred',
                mailRetry: 0,
                individu: {
                    email: email,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });


    it('should resend email to stagiaire already contacted but without avis (ResendAction)', async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize('name')}@email.fr`;
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: randomize('stagiaire'),
                codeRegion: '93',
                mailSent: true,
                unsubscribe: false,
                avisCreated: false,
                mailRetry: 0,
                mailSentDate: moment().subtract('10', 'days').toDate(),
                individu: {
                    email: email,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailAddresses(), [email]);
    });

    it('should not resend email to stagiaire with avis (ResendAction)', async () => {

        let db = await getTestDatabase();
        let { mailer, emails } = await createEmailMocks();
        let email = `${randomize('name')}@email.fr`;
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                _id: randomize('stagiaire'),
                codeRegion: '93',
                mailSent: true,
                unsubscribe: false,
                avisCreated: true,
                mailRetry: 0,
                mailSentDate: moment().subtract('10', 'days').toDate(),
                individu: {
                    email: email,
                },
            })),
        ]);

        await sendAvisEmails(db, logger, emails, action);

        assert.deepStrictEqual(mailer.getEmailMessagesSent(), []);
    });
}));
