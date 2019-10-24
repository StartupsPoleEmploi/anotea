const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../../../helpers/with-mongodb');
const { newTrainee, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/fake-logger');
const AvisMailer = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/AvisMailer');
const SendAction = require('../../../../../../src/jobs/mailing/stagiaires/avis/tasks/actions/SendAction');
const { successMailer } = require('../../fake-mailers');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should send email to new trainee', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = new AvisMailer(db, logger, successMailer(emailsSent));
        let action = new SendAction(configuration);
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                _id: id,
                codeRegion: '11',
                sourceIDF: null,
                mailSent: false,
                unsubscribe: false,
                trainee: {
                    email: email,
                },
            })),
            insertIntoDatabase('trainee', newTrainee({
                codeRegion: '11',
                sourceIDF: null,
                mailSent: false,
                unsubscribe: true,
                trainee: {
                    email: 'not-sent@trainee.org',
                },
            })),
            insertIntoDatabase('trainee', newTrainee({
                codeRegion: '11',
                sourceIDF: null,
                mailSent: false,
                avisCreated: true,
                unsubscribe: false,
                trainee: {
                    email: 'not-sent-either@trainee.org',
                },
            })),
        ]);

        await avisMailer.sendEmails(action);

        assert.deepStrictEqual(emailsSent, [{ to: email }]);
    });

    it('should ignore region', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let avisMailer = new AvisMailer(db, logger, successMailer(emailsSent));
        await Promise.all([
            insertIntoDatabase('trainee', newTrainee({
                codeRegion: 'XX',
                sourceIDF: null,
                mailSent: false,
                unsubscribe: false,
            })),
        ]);

        let handler = new SendAction(configuration, {
            codeRegions: ['11']
        });
        await avisMailer.sendEmails(handler);

        assert.deepStrictEqual(emailsSent, []);
    });


}));
