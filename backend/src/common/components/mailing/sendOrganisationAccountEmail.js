const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer) => {

    return (organisme, options = {}) => {
        return new Promise((resolve, reject) => {
            mailer.sendOrganisationAccountLink({ to: getOrganismeEmail(organisme) }, organisme,
                async () => {
                    await db.collection('account').update({ '_id': organisme._id }, {
                        $set: {
                            mailSentDate: new Date(),
                            resent: true
                        },
                        $unset: {
                            mailError: '',
                            mailErrorDetail: ''
                        },
                    });

                    resolve();
                },
                err => reject(new Error(err)));
        });
    };
};
