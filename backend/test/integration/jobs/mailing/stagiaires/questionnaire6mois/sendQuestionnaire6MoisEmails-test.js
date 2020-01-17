const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newStagiaire, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const sendQuestionnaire6MoisEmails = require('../../../../../../src/jobs/mailing/stagiaires/questionnaire6mois/tasks/sendQuestionnaire6MoisEmails');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, createEmailMocks }) => {

    it('should send email to stagiaire', async () => {

        let { mailer, emails } = await createEmailMocks();
        let db = await getTestDatabase();
        let email = `${randomize('name')}@email.fr`;
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                campaign: 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05',
                personal: {
                    email,
                },
            })),
            insertIntoDatabase('stagiaires', newStagiaire({
                personal: {
                    email: 'not-sent@stagiaire.org',
                },
            })),
        ]);

        await sendQuestionnaire6MoisEmails(db, logger, emails);

        assert.strictEqual(mailer.getLastEmailMessageSent().email, email);
        let stagiaire = await db.collection('stagiaires').findOne({ 'personal.email': email });
        let status = stagiaire.mailing.questionnaire6Mois;
        assert.ok(status.mailSent);
        assert.ok(status.mailSentDate);
        assert.deepStrictEqual(status.mailError, undefined);
        assert.deepStrictEqual(status.mailErrorDetail, undefined);
        assert.deepStrictEqual(status.mailRetry, 0);
    });

    it('should not resend email to stagiaire', async () => {

        let { mailer, emails } = await createEmailMocks();
        let db = await getTestDatabase();
        let email = `${randomize('name')}@email.fr`;
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                campaign: 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05',
                mailSent: false,
                mailSentDate: null,
                personal: {
                    email,
                },
                mailing: {
                    questionnaire6Mois: {
                        mailSent: true,
                    }
                }
            })),
        ]);

        await sendQuestionnaire6MoisEmails(db, logger, emails);

        assert.strictEqual(mailer.getEmailMessagesSent().length, 0);
    });

    it('should flag stagiaire when mailer fails', async () => {

        let db = await getTestDatabase();
        let { emails } = await createEmailMocks({ fail: true });
        let email = `${randomize('name')}@email.fr`;
        await Promise.all([
            insertIntoDatabase('stagiaires', newStagiaire({
                campaign: 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05',
                personal: {
                    email,
                },
            })),
        ]);

        try {
            await sendQuestionnaire6MoisEmails(db, logger, emails);
            assert.fail();
        } catch (e) {
            let stagiaire = await db.collection('stagiaires').findOne({ 'personal.email': email });
            let status = stagiaire.mailing.questionnaire6Mois;
            assert.strictEqual(status.mailSent, true);
            assert.strictEqual(status.mailSentDate, undefined);
            assert.deepStrictEqual(status.mailError, 'smtpError');
            assert.deepStrictEqual(status.mailErrorDetail, 'Unable to send email');
        }
    });
}));
