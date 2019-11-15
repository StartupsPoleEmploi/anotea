const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newTrainee, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const fakeMailer = require('../../../../../helpers/components/fake-new-mailer');
const questionnaire6MoisEmail = require('../../../../../../src/common/components/emails/questionnaire6MoisEmail');
const sendQuestionnaire6MoisEmails = require('../../../../../../src/jobs/mailing/stagiaires/questionnaire6mois/tasks/sendQuestionnaire6MoisEmails');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, getComponents }) => {

    let fakeEmailCreator = async (mailerOptions = {}) => {
        let db = await getTestDatabase();
        let { regions, templates } = await getComponents();

        let mailer = fakeMailer(mailerOptions);
        return questionnaire6MoisEmail(db, regions, mailer, templates);
    };

    it('should send email to stagiaire', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let email = `${randomize('name')}@email.fr`;
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                campaign: 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05',
                trainee: {
                    email,
                },
            })),
            insertIntoDatabase('trainee', newTrainee({
                trainee: {
                    email: 'not-sent@trainee.org',
                },
            })),
        ]);

        await sendQuestionnaire6MoisEmails(db, logger, await fakeEmailCreator({ calls: emailsSent }));

        assert.strictEqual(emailsSent[0].email, email);
        let trainee = await db.collection('trainee').findOne({ 'trainee.email': email });
        let status = trainee.mailing.questionnaire6Mois;
        assert.ok(status.mailSent);
        assert.ok(status.mailSentDate);
        assert.deepStrictEqual(status.mailError, undefined);
        assert.deepStrictEqual(status.mailErrorDetail, undefined);
        assert.deepStrictEqual(status.mailRetry, 0);
    });

    it('should not resend email to stagiaire', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let email = `${randomize('name')}@email.fr`;
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                campaign: 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05',
                mailSent: false,
                mailSentDate: null,
                trainee: {
                    email,
                },
                mailing: {
                    questionnaire6Mois: {
                        mailSent: true,
                    }
                }
            })),
        ]);

        await sendQuestionnaire6MoisEmails(db, logger, await fakeEmailCreator({ calls: emailsSent }));

        assert.strictEqual(emailsSent.length, 0);
    });

    it('should flag trainee when mailer fails', async () => {

        let db = await getTestDatabase();
        let email = `${randomize('name')}@email.fr`;
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                campaign: 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05',
                trainee: {
                    email,
                },
            })),
        ]);

        try {
            await sendQuestionnaire6MoisEmails(db, logger, await fakeEmailCreator({ fail: true }));
            assert.fail();
        } catch (e) {
            let trainee = await db.collection('trainee').findOne({ 'trainee.email': email });
            let status = trainee.mailing.questionnaire6Mois;
            assert.strictEqual(status.mailSent, true);
            assert.strictEqual(status.mailSentDate, undefined);
            assert.deepStrictEqual(status.mailError, 'smtpError');
            assert.deepStrictEqual(status.mailErrorDetail, 'Unable to send email');
        }
    });
}));
