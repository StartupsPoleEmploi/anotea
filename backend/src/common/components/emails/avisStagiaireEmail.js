module.exports = (db, regions, mailer, templates) => {

    return trainee => {

        let region = regions.findRegionByCodeRegion(trainee.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);
        let token = trainee.token;
        let unsubscribeLink = templates.getUnsubscribeLink(token);

        let onSuccess = () => {
            return db.collection('trainee').updateOne({ '_id': trainee._id }, {
                $set: {
                    mailSent: true,
                    mailSentDate: new Date(),
                },
                $unset: {
                    mailError: '',
                    mailErrorDetail: ''
                },
                $inc: {
                    mailRetry: trainee.mailRetry >= 0 ? 1 : 0
                }
            });
        };

        let onError = async err => {
            db.collection('trainee').updateOne({ '_id': trainee._id }, {
                $set: {
                    mailSent: true,
                    mailError: 'smtpError',
                    mailErrorDetail: err.message
                }
            });

            throw err;
        };

        let render = (options = {}) => {
            return templates.render('avis_stagiaire', {
                trainee,
                region,
                unsubscribeLink,
                trackingLink: templates.getTrackingLink(token),
                consultationLink: templates.getPublicUrl(`/mail/${token}?${templates.getUTM(trainee.campaign)}`),
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
