let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    const templateName = 'reponseRejectedEmail';

    let render = (organisme, comment, options = {}) => {
        return utils.render(__dirname, templateName, {
            organisme,
            reponse: comment.reponse.text,
            ...options,
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
                    subject: 'Pôle Emploi - Votre réponse n\'a pas été prise en compte',
                    body: await render(organisme, comment, { webView: false }),
                },
            );
        },
    };
};
