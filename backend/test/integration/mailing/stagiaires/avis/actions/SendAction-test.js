const assert = require('assert');
const configuration = require('config');
const { withMongoDB } = require('../../../../../helpers/test-db');
const { newTrainee, randomize } = require('../../../../../helpers/data/dataset');
const logger = require('../../../../../helpers/test-logger');
const AvisMailer = require('../../../../../../jobs/mailing/stagiaires/avis/AvisMailer');
const SendAction = require('../../../../../../jobs/mailing/stagiaires/avis/actions/SendAction');
const { successMailer } = require('../../fake-mailers');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should select trainee according to its state', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let id = randomize('trainee');
        let email = `${randomize('name')}@email.fr`;
        let avisMailer = new AvisMailer(db, logger, successMailer(emailsSent));
        let handler = new SendAction(db, configuration);
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
        ]);

        await avisMailer.sendEmails(handler);

        assert.deepEqual(emailsSent, [{ to: email }]);
    });


}));
