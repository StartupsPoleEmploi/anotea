let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    const templateName = 'avisReportedCanceledEmail';

    let render = (organisme, options = {}) => {
        return utils.render(__dirname, templateName, {
            organisme,
            ...utils.getOrganismeGlobals(templateName, organisme),
            ...options
        });
    };


    return {
        templateName,
        render,
        send: async (organisme, options = {}) => {
            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            return mailer.createRegionalMailer(region).sendEmail(
                getOrganismeEmail(organisme),
                {
                    subject: 'Pôle Emploi - Avis signalé dans votre Espace Anotéa',
                    body: await render(organisme, { ...options, webView: false }),
                },
            );
        },
    };
};
