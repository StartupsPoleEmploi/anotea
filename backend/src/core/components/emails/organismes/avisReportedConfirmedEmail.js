let getOrganismeEmail = require("../../../utils/getOrganismeEmail");

module.exports = (db, regions, mailer) => {

    const templateName = "avisReportedConfirmedEmail";

    let render = (organisme, comment) => {
        return mailer.render(__dirname, templateName, {
            organisme,
            comment
        });
    };

    return {
        templateName,
        render,
        send: async (organisme, comment) => {
            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            return mailer.createRegionalMailer(region).sendEmail(
                getOrganismeEmail(organisme),
                {
                    subject: "Pôle Emploi - Avis signalé dans votre Espace Anotéa",
                    body: await render(organisme, comment),
                },
            );
        },
    };
};
