module.exports = (db, regions, mailer) => {

    const templateName = 'avisReportedCanceledEmail';

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
                    codeMessage: 'ANOTEA_ORGANISME_AVIS_CONSERVE',
                    usager: false,
                    organismeToken: organisme.token,
                    texteAvis: avis?.commentaire?.text,
                    avisToken: avis.token,
                },
            );
        },
    };
};
