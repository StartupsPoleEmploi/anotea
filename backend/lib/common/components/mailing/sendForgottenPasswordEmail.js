const getContactEmail = require('../getContactEmail');
const uuid = require('node-uuid');

module.exports = (db, mailer) => {

    return async organisme => {
        let contact = getContactEmail(organisme);
        let passwordToken = uuid.v4();

        await db.collection('forgottenPasswordTokens').insertOne({ token: passwordToken, id: organisme._id });
        return new Promise((resolve, reject) => {
            mailer.sendOrganisationPasswordForgotten({ to: contact }, organisme, passwordToken,
                async () => {
                    await db.collection('organismes').update({ _id: organisme._id }, {
                        $set: { mailSentDate: new Date() },
                        $unset: {
                            mailError: '',
                            mailErrorDetail: ''
                        }
                    });
                    await db.collection('events').insertOne({
                        organisationId: organisme.id,
                        date: new Date(),
                        type: 'askNewPassword'
                    });
                    resolve();
                },
                async err => {
                    await db.collection('organismes').update({ _id: organisme._id }, {
                        $set: {
                            mailError: 'smtpError',
                            mailErrorDetail: err
                        }
                    });
                    reject(new Error(err));
                });
        });
    };
};
