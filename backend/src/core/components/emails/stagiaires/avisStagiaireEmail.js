module.exports = (db, regions, mailer) => {

    const templateName = 'avisStagiaireEmail';
    let { utils } = mailer;

    let render = stagiaire => {
        let utm = utils.getUTM(stagiaire.campaign);

        return mailer.render(__dirname, templateName, {
            stagiaire,
            link: utils.getPublicUrl(`/questionnaire/${(stagiaire.token)}?${(utm)}`),
        });
    };

    return {
        templateName,
        render,
        send: async stagiaire => {

            let onSuccess = () => {
                return db.collection('stagiaires').updateOne({ '_id': stagiaire._id }, {
                    $set: {
                        mailSent: true,
                        mailSentDate: new Date(),
                    },
                    $unset: {
                        mailError: '',
                        mailErrorDetail: ''
                    },
                    $inc: {
                        mailRetry: stagiaire.mailRetry >= 0 ? 1 : 0
                    }
                });
            };

            let onError = async err => {
                await db.collection('stagiaires').updateOne({ '_id': stagiaire._id }, {
                    $set: {
                        mailSent: true,
                        mailError: 'smtpError',
                        mailErrorDetail: err.message
                    }
                });

                throw err;
            };

            let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);
            return mailer.createRegionalMailer(region).sendEmail(
                stagiaire.personal.email,
                {
                    subject: 'Pôle Emploi vous demande votre avis sur votre formation',
                    body: await render(stagiaire),
                },
                {
                    list: {
                        unsubscribe: utils.getUnsubscribeLink(stagiaire.token),
                    },
                }
            )
            .then(onSuccess)
            .catch(onError);
        },
    };
};
