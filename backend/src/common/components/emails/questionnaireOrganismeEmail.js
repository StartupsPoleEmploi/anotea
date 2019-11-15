module.exports = (db, regions, mailer, templates) => {

    return organisme => {

        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);

        let onSuccess = () => {
            return db.collection('accounts').updateOne({ '_id': organisme._id }, {
                $set: {
                    'mailing.questionnaire.mailSent': true,
                    'mailing.questionnaire.mailSentDate': new Date(),
                },
                $unset: {
                    'mailing.questionnaire.mailError': '',
                    'mailing.questionnaire.mailErrorDetail': ''
                },
                $inc: {
                    'mailing.questionnaire.mailRetry': organisme.mailRetry >= 0 ? 1 : 0
                }
            });
        };

        let onError = err => {
            return this.db.collection('accounts').updateOne({ '_id': organisme._id }, {
                $set: {
                    'mailing.questionnaire.mailSent': true,
                    'mailing.questionnaire.mailError': 'smtpError',
                    'mailing.questionnaire.mailErrorDetail': err.message
                }
            });
        };

        let render = (options = {}) => {
            return templates.render('organisme_questionnaire', {
                organisme,
                formLink: 'https://avril_la_vae_facile.typeform.com/to/X4oxTv',
                ...options,
            });
        };

        return {
            render,
            send: async emailAddress => {
                let body = await render({ webView: false });

                return regionalMailer.sendEmail(
                    emailAddress,
                    {
                        subject: 'Aidez-nous à améliorer Anotéa',
                        body,
                    },
                )
                .then(onSuccess)
                .catch(onError);
            },
        };
    };
};
