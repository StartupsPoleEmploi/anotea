module.exports = (db, regions, mailer, templates) => {

    return organisme => {

        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);

        let render = (options = {}) => {

            let token = organisme.token;

            return templates.render('account_activation', {
                organisme,
                contact: templates.getRegionEmail(region),
                link: templates.getPublicUrl(`/admin/activation-compte?token=${token}`),
                trackingLink: templates.getTrackingLink(token),
                consultationLink: templates.getPublicUrl(`/mail/${token}/password`),
                ...options,
            });
        };

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

        let onError = err => {
            return db.collection('accounts').updateOne({ '_id': organisme._id }, {
                $set: {
                    mailError: 'smtpError',
                    mailErrorDetail: err.message
                }
            });
        };

        return {
            render,
            send: async emailAddress => {
                let body = await render({ webView: false });

                return regionalMailer.sendEmail(
                    emailAddress,
                    {
                        subject: 'Pôle Emploi vous donne accès aux avis de vos stagiaires',
                        body,
                    },
                )
                .then(onSuccess)
                .catch(onError);
            },
        };
    };
};
