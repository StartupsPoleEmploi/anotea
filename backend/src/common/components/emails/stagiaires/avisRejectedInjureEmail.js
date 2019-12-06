module.exports = (db, regions, mailer, utils) => {

    const templateName = 'avisRejectedInjureEmail';

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

            let training = trainee.training;
            let region = regions.findRegionByCodeRegion(trainee.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                trainee.trainee.email,
                {
                    subject: `Rejet de votre avis sur votre formation ${training.title} à ${training.organisation.name}`,
                    body: await render(trainee),
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
