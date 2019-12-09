module.exports = (db, regions, mailer) => {

    const templateName = 'avisRejectedAlerteEmail';
    let { utils } = mailer;

    let render = trainee => {
        return mailer.render(__dirname, templateName, {
            trainee,
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
