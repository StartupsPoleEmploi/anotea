module.exports = (db, regions, mailer) => {

    const templateName = 'avisStagiaireEmail';
    let { utils } = mailer;

    let render = trainee => {
        let utm = utils.getUTM(trainee.campaign);

        return mailer.render(__dirname, templateName, {
            trainee,
            link: utils.getPublicUrl(`/questionnaire/${(trainee.token)}?${(utm)}`),
        });
    };

    return {
        templateName,
        render,
        send: async trainee => {

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
                await db.collection('trainee').updateOne({ '_id': trainee._id }, {
                    $set: {
                        mailSent: true,
                        mailError: 'smtpError',
                        mailErrorDetail: err.message
                    }
                });

                throw err;
            };

            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            return mailer.createRegionalMailer(region).sendEmail(
                trainee.trainee.email,
                {
                    subject: 'Pôle Emploi vous demande votre avis sur votre formation',
                    body: await render(trainee),
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
