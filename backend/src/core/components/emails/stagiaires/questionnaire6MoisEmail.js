const BadDataError = require('./../../../errors');

module.exports = (db, regions, mailer) => {

    const templateName = 'questionnaire6MoisEmail';
    let { utils } = mailer;

    let render = stagiaire => {
        return mailer.render(__dirname, templateName, {
            stagiaire,
            link: 'https://avril_la_vae_facile.typeform.com/to/gIFh4q',
        });
    };

    return {
        templateName,
        render,
        send: async stagiaire => {
            if (!stagiaire.individu || !stagiaire.individu.email) {
                throw new BadDataError(`Le courriel de l'individu a été supprimé pour raison de RGPD. `);
            }
            let onSuccess = () => {
                return db.collection('stagiaires').updateOne({ '_id': stagiaire._id }, {
                    $set: {
                        'mailing.questionnaire6Mois.mailSent': true,
                        'mailing.questionnaire6Mois.mailSentDate': new Date(),
                    },
                    $unset: {
                        'mailing.questionnaire6Mois.mailError': '',
                        'mailing.questionnaire6Mois.mailErrorDetail': ''
                    },
                    $inc: {
                        'mailing.questionnaire6Mois.mailRetry': stagiaire.mailRetry >= 0 ? 1 : 0
                    }
                });
            };

            let onError = async err => {
                await db.collection('stagiaires').updateOne({ '_id': stagiaire._id }, {
                    $set: {
                        'mailing.questionnaire6Mois.mailSent': true,
                        'mailing.questionnaire6Mois.mailError': 'smtpError',
                        'mailing.questionnaire6Mois.mailErrorDetail': err.message
                    }
                });
                throw err;
            };

            let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                stagiaire.individu.email,
                {
                    subject: 'France Travail vous demande votre avis sur votre formation',
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
