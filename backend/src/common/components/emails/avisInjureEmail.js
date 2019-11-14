const emailHelper = require('../../../smtp/emailHelper');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);

    let getUnsubscribeLink = token => helper.getPublicUrl(`/mail/${token}/unsubscribe`);

    let build = (trainee, comment, options = {}) => {

        let token = trainee.token;
        let utm = `utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`;
        let region = regions.findRegionByCodeRegion(trainee.codeRegion);

        return helper.templates('avis_injure', {
            trainee,
            unsubscribeLink: getUnsubscribeLink(token),
            consultationLink: helper.getPublicUrl(`/mail/${token}/injure?${utm}`),
            formLink: helper.getPublicUrl(`/questionnaire/${token}?${utm}`),
            email: helper.getRegionEmail(region),
            ...options,
        });
    };

    return {
        build,
        send: async (trainee, comment) => {

            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            let content = await build(trainee, comment, { webView: false });

            return mailer.sendNewEmail(trainee.trainee.email, region, {
                subject: 'Rejet de votre avis sur votre formation' +
                    `${trainee.training.title} à ${trainee.training.organisation.name}`,
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
