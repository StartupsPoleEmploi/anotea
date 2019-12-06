let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    const templateName = 'activationCompteEmail';

    let render = (organisme, options = {}) => {
        return utils.render(__dirname, templateName, {
            organisme,
            link: utils.getPublicUrl(`/admin/activation-compte?token=${(organisme.token)}`),
            ...options,
        });
    };

    return {
        templateName,
        render,
        send: async organisme => {

            let onSuccess = () => {
                return db.collection('accounts').updateOne({ '_id': organisme._id }, {
                    $set: {
                        mailSentDate: new Date(),
                        resend: !!organisme.mailSentDate,
                    },
                    $unset: {
                        mailError: '',
                        mailErrorDetail: ''
                    },
                });
            };

            let onError = async err => {
                await db.collection('accounts').updateOne({ '_id': organisme._id }, {
                    $set: {
                        mailError: 'smtpError',
                        mailErrorDetail: err.message
                    }
                });
                throw err;
            };

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            return mailer.createRegionalMailer(region).sendEmail(
                getOrganismeEmail(organisme),
                {
                    subject: 'Pôle Emploi vous donne accès aux avis de vos stagiaires',
                    body: await render(organisme),
                },
            )
            .then(onSuccess)
            .catch(onError);
        },
    };
};
