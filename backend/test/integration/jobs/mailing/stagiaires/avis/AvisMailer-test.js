const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newTrainee, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const AvisMailer = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/AvisMailer');
const fakeMailer = require('../../../../../helpers/components/fake-mailer');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should send email to trainee', async () => {

        let mailer = fakeMailer();
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = new AvisMailer(db, logger, mailer);
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                trainee: {
                    email: email,
                },
            })),
        ]);

        let results = await avisMailer.sendEmails({
            getQuery: () => ({ _id: id }),
        });

        let emailSent = mailer.getLastEmailSent();
        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(emailSent[0], {
            to: email,
        });
    });

    it('should update trainee when mailer succeed', async () => {

        let db = await getTestDatabase();
        let mailer = fakeMailer();
        let avisMailer = new AvisMailer(db, logger, mailer);
        let id = randomize('trainee');
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                trainee: {
                    email: `${randomize('name')}@email.fr`,
                },
            })),
        ]);

        await avisMailer.sendEmails({
            getQuery: () => ({}),
        });

        let trainee = await db.collection('trainee').findOne({ _id: id });
        assert.ok(trainee.mailSent);
        assert.ok(trainee.mailSentDate);
        assert.deepStrictEqual(trainee.mailError, undefined);
        assert.deepStrictEqual(trainee.mailErrorDetail, undefined);
        assert.deepStrictEqual(trainee.mailRetry, 0);
    });

    it('should increase maxRetry when an email has already been sent', async () => {

        let db = await getTestDatabase();
        let mailer = fakeMailer();
        let avisMailer = new AvisMailer(db, logger, mailer);
        let id = randomize('trainee');
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                mailRetry: 0,
                trainee: {
                    email: `${randomize('name')}@email.fr`,
                },
            })),
        ]);

        await avisMailer.sendEmails({
            getQuery: () => ({}),
        });

        let trainee = await db.collection('trainee').findOne({ _id: id });
        assert.deepStrictEqual(trainee.mailRetry, 1);
    });

    it('should update trainee when mailer fails', async () => {

        let db = await getTestDatabase();
        let avisMailer = new AvisMailer(db, logger, fakeMailer({ fail: true }));
        let id = randomize('trainee');
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                trainee: {
                    email: `${randomize('name')}@email.fr`,
                },
            })),
        ]);

        try {
            await avisMailer.sendEmails({
                getQuery: () => ({}),
            });
            assert.fail();
        } catch (e) {
            let trainee = await db.collection('trainee').findOne({ _id: id });
            assert.ok(trainee.mailSent);
            assert.deepStrictEqual(trainee.mailError, 'smtpError');
            assert.deepStrictEqual(trainee.mailErrorDetail, 'Unable to send email');
            assert.deepStrictEqual(e, {
                total: 1,
                sent: 0,
                error: 1,
            });
        }
    });
}));
