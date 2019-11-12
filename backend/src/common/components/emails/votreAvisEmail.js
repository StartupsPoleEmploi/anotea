const moment = require('moment');
const emailHelper = require('../../../smtp/emailHelper');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);
    let onSuccess = trainee => {
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

    let onError = (err, trainee) => {
        return db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                mailSent: true,
                mailError: 'smtpError',
                mailErrorDetail: err.message
            }
        });
    };

    let getUnsubscribeLink = token => helper.getPublicUrl(`/mail/${token}/unsubscribe`);

    let build = async (trainee, options = {}) => {
        let region = regions.findRegionByCodeRegion(trainee.codeRegion);
        let token = trainee.token;
        let utm = `utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`;

        let params = {
            hostname: helper.getHostname(),
            trainee,
            moment,
            region,
            trackingLink: helper.getTrackingLink(token),
            unsubscribeLink: getUnsubscribeLink(token),
            consultationLink: helper.getPublicUrl(`/mail/${token}?${utm}`),
            formLink: helper.getPublicUrl(`/questionnaire/${token}?${utm}`),
            ...options,
        };

        let [html, text] = await Promise.all([
            helper.templateHTML('votre_avis', params),
            helper.templateText('votre_avis', params),
        ]);

        return { html, text };
    };

    return {
        build,
        send: async trainee => {
            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            let content = await build(trainee, { webView: false });

            return mailer.sendNewEmail(trainee.trainee.email, region, {
                subject: 'Pôle Emploi vous demande votre avis sur votre formation',
                list: {
                    help: {
                        url: 'https://anotea.pole-emploi.fr/faq'
                    },
                    unsubscribe: {
                        url: getUnsubscribeLink(trainee.token),
                    }
                },
                ...content,
            })
            .then(() => onSuccess(trainee))
            .catch(async err => {
                await onError(err, trainee);
                throw err;
            });
        },
    };
};
