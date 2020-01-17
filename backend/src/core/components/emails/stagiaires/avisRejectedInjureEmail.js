module.exports = (db, regions, mailer) => {

    const templateName = 'avisRejectedInjureEmail';
    let { utils } = mailer;

    let render = stagiaire => {
        return mailer.render(__dirname, templateName, {
            stagiaire,
        });
    };

    return {
        templateName,
        render,
        send: async stagiaire => {

            let training = stagiaire.training;
            let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                stagiaire.personal.email,
                {
                    subject: `Rejet de votre avis sur votre formation ${training.title} à ${training.organisation.name}`,
                    body: await render(stagiaire),
                },
                {
                    list: {
                        unsubscribe: utils.getUnsubscribeLink(stagiaire.token),
                    },
                }
            );
        },
    };
};
