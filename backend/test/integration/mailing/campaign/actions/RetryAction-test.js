const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../../helpers/test-db');
const { newTrainee, randomize } = require('../../../../helpers/data/dataset');
const logger = require('../../../../helpers/test-logger');
const CampaignMailer = require('../../../../../jobs/mailing/campaign/CampaignMailer');
const RetryAction = require('../../../../../jobs/mailing/campaign/actions/RetryAction');
const { successMailer } = require('../fake-mailers');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should select trainee according to its state', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
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

        let campaignMailer = new CampaignMailer(db, logger, successMailer(emailsSent));
        let handler = new RetryAction(db, configuration);

        await campaignMailer.sendEmails(handler);

        assert.deepEqual(emailsSent, [{ to: email }]);
    });

}));
