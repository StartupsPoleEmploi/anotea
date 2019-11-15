module.exports = (db, regions, mailer, templates) => {

    return trainee => {

        let region = regions.findRegionByCodeRegion(trainee.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);
        let token = trainee.token;
        let unsubscribeLink = templates.getUnsubscribeLink(token);

        let onSuccess = () => {
            return db.collection('trainee').updateOne({ '_id': trainee._id }, {
                $set: {
                    'mailing.questionnaire6Mois.mailSent': true,
                    'mailing.questionnaire6Mois.mailSentDate': new Date(),
                },
                $unset: {
                    'mailing.questionnaire6Mois.mailError': '',
                    'mailing.questionnaire6Mois.mailErrorDetail': ''
                },
                $inc: {
                    'mailing.questionnaire6Mois.mailRetry': trainee.mailRetry >= 0 ? 1 : 0
                }
            });
        };

        let onError = err => {
            return db.collection('trainee').updateOne({ '_id': trainee._id }, {
                $set: {
                    'mailing.questionnaire6Mois.mailSent': true,
                    'mailing.questionnaire6Mois.mailError': 'smtpError',
                    'mailing.questionnaire6Mois.mailErrorDetail': err.message
                }
            });
        };

        let render = (options = {}) => {
            return templates.render('questionnaire_6mois', {
                trainee,
                region,
                unsubscribeLink,
                formLink: templates.getPublicUrl(`/questionnaire/${token}?${templates.getUTM(trainee.campaign)}`),
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
                        subject: 'Pôle Emploi vous demande votre avis sur votre formation',
                        body,
                    },
                    {
                        list: {
                            unsubscribe: unsubscribeLink,
                        },
                    }
                )
                .then(onSuccess)
                .catch(onError);
            },
        };
    };
};
