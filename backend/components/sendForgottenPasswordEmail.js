const getContactEmail = require('./getContactEmail');
const uuid = require('node-uuid');

module.exports = (db, logger, mailer) => {

    return async organisme => {
        let contact = getContactEmail(organisme);
        let passwordToken = uuid.v4();

        await db.collection('forgottenPasswordTokens').save({ token: passwordToken, id: organisme._id });

        mailer.sendOrganisationPasswordForgotten({ to: contact }, organisme, passwordToken, () => {
            db.collection('organismes').update({ _id: organisme._id }, {
                $set: { mailSentDate: new Date() },
                $unset: {
                    mailError: '',
                    mailErrorDetail: ''
                }
            });
            db.collection('events').save({
                organisationId: organisme.id,
                date: new Date(),
                type: 'askNewPassword'
            });
        }, err => {
            logger.error(`Unable to send email to ${contact}`, err);
            db.collection('organismes').update({ _id: organisme._id }, {
                $set: {
                    mailError: 'smtpError',
                    mailErrorDetail: err
                }
            });
        });
    };
};
