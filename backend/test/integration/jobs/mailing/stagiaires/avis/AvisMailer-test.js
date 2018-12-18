const assert = require('assert');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newTrainee, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/test-logger');
const AvisMailer = require('../../../../../../lib/jobs/mailing/stagiaires/avis/AvisMailer');
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

        assert.deepEqual(results, {
            total: 1,
            sent: 1,
            error: 0,
        });
        assert.deepEqual(emailsSent, [{
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
        assert.deepEqual(trainee.mailError, undefined);
        assert.deepEqual(trainee.mailErrorDetail, undefined);
        assert.deepEqual(trainee.mailRetry, 0);
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
            assert.deepEqual(trainee.mailError, 'smtpError');
            assert.deepEqual(trainee.mailErrorDetail, 'timeout');
            assert.deepEqual(e, {
                total: 1,
                sent: 0,
                error: 1,
            });
        }
    });
}));
