module.exports = (db, regions, mailer, utils) => {

    const templateName = 'avisStagiaireEmail';

    let render = (trainee, options = {}) => {

        let utm = utils.getUTM(trainee.campaign);

        return utils.render(__dirname, templateName, {
            trainee,
            link: utils.getPublicUrl(`/questionnaire/${(trainee.token)}?${(utm)}`),
            ...utils.getStagiaireGlobals(templateName, trainee),
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
