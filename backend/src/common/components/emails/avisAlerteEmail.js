const emailHelper = require('../../../smtp/emailHelper');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);

    let getUnsubscribeLink = token => helper.getPublicUrl(`/mail/${token}/unsubscribe`);

    let build = (trainee, comment, options = {}) => {

        let token = trainee.token;
        let utm = `utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`;

        return helper.templates('avis_alerte', {
            trainee,
            unsubscribeLink: getUnsubscribeLink(token),
            consultationLink: helper.getPublicUrl(`/mail/${token}/injure?${utm}`),
            ...options,
        });
    };

    return {
        build,
        send: async (trainee, comment) => {

            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            let content = await build(trainee, comment, { webView: false });

            return mailer.sendNewEmail(trainee.trainee.email, region, {
                subject: 'Nous avons bien pris en compte votre commentaire',
                list: {
                    help: {
                        url: 'https://anotea.pole-emploi.fr/faq'
                    },
                    unsubscribe: {
                        url: getUnsubscribeLink(trainee.token),
                    }
                },
                ...content,
            });
        },
    };
};
