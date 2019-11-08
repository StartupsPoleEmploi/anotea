const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer) => {

    return organisme => {
        return mailer.sendOrganisationAccountEmail({ to: getOrganismeEmail(organisme) }, organisme)
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
