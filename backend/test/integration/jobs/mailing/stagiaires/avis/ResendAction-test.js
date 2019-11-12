const assert = require('assert');
const moment = require('moment');
const configuration = require('config');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newTrainee, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/components/fake-logger');
const fakeMailer = require('../../../../../helpers/components/fake-mailer');
const AvisMailer = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/AvisMailer');
const votreAvisEmail = require('../../../../../../src/common/components/emails/votreAvisEmail');
const ResendAction = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/ResendAction');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase, getComponents }) => {

    let createAvisMailer = async mailer => {
        let db = await getTestDatabase();
        let { regions } = await getComponents();

        let email = votreAvisEmail(db, mailer, configuration, regions);
        return new AvisMailer(db, logger, email);
    };

    it('should send email to trainee already contacted but without avis', async () => {

        let mailer = fakeMailer();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = await createAvisMailer(mailer);
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

        assert.strictEqual(mailer.getLastEmailAddress(), email);
    });

    it('should not send email to trainee with avis', async () => {

        let mailer = fakeMailer();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = await createAvisMailer(mailer);
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

        assert.deepStrictEqual(mailer.getCalls(), []);
    });

}));
