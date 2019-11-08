const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer) => {

    return organisme => {
        let email = getOrganismeEmail(organisme);
        return mailer.sendOrganisationAccountEmail(email, organisme)
        .then(() => {
            return db.collection('accounts').update({ '_id': organisme._id }, {
                $set: {
                    mailSentDate: new Date(),
                    resent: true
                },
                $unset: {
                    mailError: '',
                    mailErrorDetail: ''
                },
            });
        });
    };
};
