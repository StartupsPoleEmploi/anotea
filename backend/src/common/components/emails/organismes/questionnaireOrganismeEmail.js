let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    let templateName = 'questionnaireOrganismeEmail';

    let render = organisme => {
        return utils.render(__dirname, templateName, {
            organisme,
            link: 'https://avril_la_vae_facile.typeform.com/to/X4oxTv',
        });
    };

    return {
        templateName,
        render,
        send: async organisme => {
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

            let onError = async err => {
                await this.db.collection('accounts').updateOne({ '_id': organisme._id }, {
                    $set: {
                        'mailing.questionnaire.mailSent': true,
                        'mailing.questionnaire.mailError': 'smtpError',
                        'mailing.questionnaire.mailErrorDetail': err.message
                    }
                });
                throw err;
            };

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                getOrganismeEmail(organisme),
                {
                    subject: 'Pôle Emploi - Aidez-nous à améliorer Anotéa',
                    body: await render(organisme),
                },
            )
            .then(onSuccess)
            .catch(onError);
        },
    };
};
