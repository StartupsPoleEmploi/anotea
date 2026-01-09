module.exports = (db, regions, mailer) => {

    const templateName = 'activationCompteEmail';
    let { utils } = mailer;

    let render = organisme => {
        return mailer.render(__dirname, templateName, {
            organisme,
            link: utils.getPublicUrl(`/backoffice/activation-compte?token=${(organisme.token)}`),
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
                organisme.courriel,
                {
                    codeMessage: 'ANOTEA_ORGANISME_COMPTE_CREE',
                    organismeToken: organisme.token,
                    siret: organisme.siret,
                    dispensateur: (organisme.score && organisme.score.nb_avis && organisme.score.nb_avis > 0) ? 'dispensateur' : 'responsable',
                },
            )
            .then(onSuccess)
            .catch(onError);
        },
    };
};
