const assert = require('assert');
const { withMongoDB } = require('../../../../helpers/with-mongodb');
const logger = require('../../../../helpers/components/fake-logger');
const { newOrganismeAccount } = require('../../../../helpers/data/dataset');
const resendOrganismeEmails = require('../../../../../src/jobs/data/emails/tasks/resendOrganismeEmails');

describe(__filename, withMongoDB(({ insertIntoDatabase, getTestDatabase, createEmailMocks }) => {

    let createCSVStream = (lines = []) => {

        const Readable = require('stream').Readable;
        const readable = new Readable();
        readable._read = () => {
        };
        lines.forEach(line => readable.push(line));
        readable.push(null);
        return readable;
    };

    it('should resend emails', async () => {

        let db = await getTestDatabase();
        let { emails, mailer } = await createEmailMocks();
        await Promise.all([
            await insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 11111111111111,
                SIRET: 11111111111111,
                courriel: 'courriel@pole-emploi.fr',
                meta: {
                    siretAsString: '11111111111111'
                },
            })),
            insertIntoDatabase('accounts', newOrganismeAccount({
                _id: 22222222222222,
                SIRET: 22222222222222,
                courriel: 'other@pole-emploi.fr',
                meta: {
                    siretAsString: '22222222222222'
                },
            })),
        ]);

        let stream = createCSVStream([
            'Siret|Nom|Email Anotea|Nombre Avis|Email Kairos\n',
            '11111111111111|Anotéa formation|before@pole-emploi.fr|744|kairos@pole-emploi.fr\n'
        ]);

        await resendOrganismeEmails(db, logger, emails, stream);

        assert.strictEqual(mailer.getEmailMessagesSent().length, 1);

        let message = mailer.getEmailMessagesSent().pop();
        assert.ok(message);
        assert.strictEqual(message.email, 'courriel@pole-emploi.fr');
        assert.strictEqual(message.parameters.subject, 'Pôle Emploi vous donne accès aux avis de vos stagiaires');
    });
}));
