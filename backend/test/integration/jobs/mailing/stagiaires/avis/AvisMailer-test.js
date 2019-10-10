const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newTrainee, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/fake-logger');
const AvisMailer = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/AvisMailer');
const { successMailer, errorMailer } = require('../../fake-mailers');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should send email to trainee', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let mailer = new AvisMailer(db, logger, successMailer(emailsSent));
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                trainee: {
                    email: email,
                },
            })),
        ]);

        let results = await mailer.sendEmails({
            getQuery: () => ({ _id: id }),
        });

        assert.deepStrictEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepStrictEqual(emailsSent, [{
            to: email,
        }]);
    });

    it('should update trainee when mailer succeed', async () => {

        let db = await getTestDatabase();
        let mailer = new AvisMailer(db, logger, successMailer());
        let id = randomize('trainee');
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                trainee: {
                    email: `${randomize('name')}@email.fr`,
                },
            })),
        ]);

        await mailer.sendEmails({
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
        let mailer = new AvisMailer(db, logger, successMailer());
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

        await mailer.sendEmails({
            getQuery: () => ({}),
        });

        let trainee = await db.collection('trainee').findOne({ _id: id });
        assert.deepStrictEqual(trainee.mailRetry, 1);
    });

    it('should update trainee when mailer fails', async () => {

        let db = await getTestDatabase();
        let mailer = new AvisMailer(db, logger, errorMailer());
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
            await mailer.sendEmails({
                getQuery: () => ({}),
            });
            assert.fail();
        } catch (e) {
            let trainee = await db.collection('trainee').findOne({ _id: id });
            assert.ok(trainee.mailSent);
            assert.deepStrictEqual(trainee.mailError, 'smtpError');
            assert.deepStrictEqual(trainee.mailErrorDetail, 'timeout');
            assert.deepStrictEqual(e, {
                total: 1,
                sent: 0,
                error: 1,
            });
        }
    });
}));
