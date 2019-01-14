const assert = require('assert');
const moment = require('moment');
const configuration = require('config');
const { withMongoDB } = require('../../../../../../helpers/test-database');
const { newTrainee, randomize } = require('../../../../../../helpers/data/dataset');
const logger = require('../../../../../../helpers/test-logger');
const AvisMailer = require('../../../../../../../src/jobs/mailing/stagiaires/avis/AvisMailer');
const ResendAction = require('../../../../../../../src/jobs/mailing/stagiaires/avis/actions/ResendAction');
const { successMailer } = require('../../../fake-mailers');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should send email to trainee already contacted but without avis', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = new AvisMailer(db, logger, successMailer(emailsSent));
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                codeRegion: '18',
                mailSent: true,
                unsubscribe: false,
                avisCreated: false,
                mailRetry: 0,
                mailSentDate: moment().subtract('10', 'days').toDate(),
                trainee: {
                    email: email,
                },
            })),
        ]);

        await avisMailer.sendEmails(action);

        assert.deepEqual(emailsSent, [{ to: email }]);
    });

    it('should not send email to trainee with avis', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = new AvisMailer(db, logger, successMailer(emailsSent));
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                codeRegion: '18',
                mailSent: true,
                unsubscribe: false,
                avisCreated: true,
                mailRetry: 0,
                mailSentDate: moment().subtract('10', 'days').toDate(),
                trainee: {
                    email: email,
                },
            })),
        ]);

        await avisMailer.sendEmails(action);

        assert.deepEqual(emailsSent, []);
    });

}));
