module.exports = (db, regions, mailer) => {

    const templateName = 'avisRejectedAlerteEmail';
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
            let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                stagiaire.individu.email,
                {
                    subject: 'Nous avons bien pris en compte votre commentaire',
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
