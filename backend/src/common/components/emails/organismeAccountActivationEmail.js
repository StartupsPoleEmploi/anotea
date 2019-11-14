const emailHelper = require('../../../smtp/emailHelper');
const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);
    let onSuccess = organisme => {
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

    let onError = (error, organisme) => {
        return db.collection('accounts').updateOne({ '_id': organisme._id }, {
            $set: {
                mailError: 'smtpError',
                mailErrorDetail: error.message
            }
        });
    };

    let build = (organisme, options = {}) => {
        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let token = organisme.token;

        return helper.templates('organisme_account_activation', {
            organisme,
            contact: helper.getRegionEmail(region),
            link: helper.getPublicUrl(`/admin/activation-compte?token=${token}`),
            trackingLink: helper.getTrackingLink(token),
            consultationLink: helper.getPublicUrl(`/mail/${token}/password`),
            ...options,
        });
    };

    return {
        build,
        send: async organisme => {
            let email = getOrganismeEmail(organisme);
            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let content = await build(organisme, { webView: false });

            return mailer.sendNewEmail(email, region, {
                subject: 'Pôle Emploi vous donne accès aux avis de vos stagiaires',
                ...content,
            })
            .then(() => onSuccess(organisme))
            .catch(async err => {
                await onError(err, organisme);
                throw err;
            });
        },
    };
};
