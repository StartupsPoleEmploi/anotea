const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../../../../helpers/test-database');
const { newTrainee, randomize } = require('../../../../../../helpers/data/dataset');
const logger = require('../../../../../../helpers/test-logger');
const AvisMailer = require('../../../../../../../lib/jobs/mailing/stagiaires/avis/AvisMailer');
const RetryAction = require('../../../../../../../lib/jobs/mailing/stagiaires/avis/actions/RetryAction');
const { successMailer } = require('../../../fake-mailers');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should send email to trainee with smtp error', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = new AvisMailer(db, logger, successMailer(emailsSent));
        let action = new RetryAction(configuration);
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                codeRegion: '18',
                mailSent: true,
                unsubscribe: false,
                mailError: 'smtpError',
                mailErrorDetail: 'An error occurred',
                mailRetry: 0,
                trainee: {
                    email: email,
                },
            })),
        ]);

        await avisMailer.sendEmails(action);

        assert.deepEqual(emailsSent, [{ to: email }]);
    });

}));
