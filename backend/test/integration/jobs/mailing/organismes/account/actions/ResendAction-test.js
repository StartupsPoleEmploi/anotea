const configuration = require('config');
const assert = require('assert');
const moment = require('moment');
const { withMongoDB } = require('../../../../../../helpers/test-db');
const { newOrganismeAccount } = require('../../../../../../helpers/data/dataset');
const logger = require('../../../../../../helpers/test-logger');
const AccountMailer = require('../../../../../../../jobs/mailing/organismes/account/AccountMailer');
const ResendAction = require('../../../../../../../jobs/mailing/organismes/account/actions/ResendAction');
const { successMailer } = require('../../../fake-mailers');

describe(__filename, withMongoDB(({ getTestDatabase, insertIntoDatabase }) => {

    it('should ignore organisme with email already resent', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, successMailer(emailsSent));
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `${31705038300064}`,
                },
                passwordHash: null,
                mailSentDate: moment().subtract('40', 'days').toDate(),
                sources: ['intercarif'],
            })),
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 11111111111,
                SIRET: 11111111111,
                courriel: 'not-sent@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `11111111111`,
                },
                passwordHash: '12345',
                mailSentDate: null,
                sources: ['intercarif'],
            })),
        ]);

        let results = await accountMailer.sendEmails(action);

        assert.deepEqual(results, { mailSent: 1 });
        assert.deepEqual(emailsSent, [{ to: 'new@organisme.fr' }]);
    });

    it('should ignore organisme with sent date lesser than relaunch delay', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, successMailer(emailsSent));
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 11111111111,
                SIRET: 11111111111,
                courriel: 'not-sent@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `11111111111`,
                },
                passwordHash: '12345',
                mailSentDate: moment().subtract('1', 'days').toDate(),
                sources: ['intercarif'],
            })),
        ]);

        let results = await accountMailer.sendEmails(action);

        assert.deepEqual(results, { mailSent: 0 });
    });

    it('should ignore organisme with password already set', async () => {

        let emailsSent = [];
        let db = await getTestDatabase();
        let accountMailer = new AccountMailer(db, logger, configuration, successMailer(emailsSent));
        let action = new ResendAction(configuration);
        await Promise.all([
            insertIntoDatabase('organismes', newOrganismeAccount({
                _id: 31705038300064,
                SIRET: 31705038300064,
                courriel: 'new@organisme.fr',
                meta: {
                    nbAvis: 1,
                    siretAsString: `${31705038300064}`,
                },
                passwordHash: '12345',
                mailSentDate: moment().subtract('40', 'days').toDate(),
                sources: ['intercarif'],
            })),
        ]);

        let results = await accountMailer.sendEmails(action);

        assert.deepEqual(results, { mailSent: 0 });
    });

}));
