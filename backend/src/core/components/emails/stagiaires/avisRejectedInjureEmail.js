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

            let formation = stagiaire.formation;
            let region = regions.findRegionByCodeRegion(stagiaire.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                stagiaire.personal.email,
                {
                    subject: `Rejet de votre avis sur votre formation ${formation.intitule} à ${formation.action.organisme_formateur.raison_sociale}`,
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
