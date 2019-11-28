let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    const templateName = 'avisReportedCanceledEmail';

    let render = (organisme, comment, options = {}) => {
        return utils.render(__dirname, templateName, {
            organisme,
            commentaire: comment.comment.text,
            ...utils.getOrganismeGlobals(templateName, organisme),
            ...options
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
                    subject: 'Pôle Emploi - Avis signalé dans votre Espace Anotéa',
                    body: await render(organisme, comment, { webView: false }),
                },
            );
        },
    };
};
