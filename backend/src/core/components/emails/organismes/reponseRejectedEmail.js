module.exports = (db, regions, mailer) => {

    const templateName = 'reponseRejectedEmail';

    let render = (organisme, avis) => {
        return mailer.render(__dirname, templateName, {
            organisme,
            avis,
        });
    };

    return {
        templateName,
        render,
        send: async (organisme, avis) => {

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);

            return mailer.createRegionalMailerV2(region).sendEmail(
                organisme.courriel,
                {
                    codeMessage: 'ANOTEA_ORGANISME_REJET_REPONSE',
                    usager: false,
                    organismeToken: organisme.token,
                    siret: organisme.siret,
                    texteReponse: avis.reponse.text,
                    avisToken: avis.token,
                },
            );
        },
    };
};
