module.exports = (db, regions, mailer, utils) => {

    const templateName = 'questionnaire6MoisEmail';

    let render = (trainee, options = {}) => {
        return utils.render(__dirname, templateName, {
            trainee,
            link: utils.getPublicUrl(`/questionnaire/${trainee.token}?${utils.getUTM(trainee.campaign)}`),
            ...options,
        });
    };

    return {
        templateName,
        render,
        send: async trainee => {
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

            let onError = async err => {
                await db.collection('trainee').updateOne({ '_id': trainee._id }, {
                    $set: {
                        'mailing.questionnaire6Mois.mailSent': true,
                        'mailing.questionnaire6Mois.mailError': 'smtpError',
                        'mailing.questionnaire6Mois.mailErrorDetail': err.message
                    }
                });
                throw err;
            };

            let region = regions.findRegionByCodeRegion(trainee.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                trainee.trainee.email,
                {
                    subject: 'Pôle Emploi vous demande votre avis sur votre formation',
                    body: await render(trainee, { webView: false }),
                },
                {
                    list: {
                        unsubscribe: utils.getUnsubscribeLink(trainee.token),
                    },
                }
            )
            .then(onSuccess)
            .catch(onError);
        },
    };
};
