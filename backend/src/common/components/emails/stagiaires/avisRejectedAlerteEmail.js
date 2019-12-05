module.exports = (db, regions, mailer, utils) => {

    const templateName = 'avisRejectedAlerteEmail';

    let render = (trainee, options = {}) => {
        return utils.render(__dirname, templateName, {
            trainee,
            ...options,
        });
    };

    return {
        templateName,
        render,
        send: async trainee => {
            let region = regions.findRegionByCodeRegion(trainee.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                trainee.trainee.email,
                {
                    subject: 'Nous avons bien pris en compte votre commentaire',
                    body: await render(trainee, { webView: false }),
                },
                {
                    list: {
                        unsubscribe: utils.getUnsubscribeLink(trainee.token),
                    },
                }
            );
        },
    };
};
