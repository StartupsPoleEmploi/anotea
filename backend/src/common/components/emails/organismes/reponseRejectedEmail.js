let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    const templateName = 'reponseRejectedEmail';

    let render = (organisme, options = {}) => {
        return utils.render(__dirname, templateName, {
            organisme,
            ...options,
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
                    subject: 'Pôle Emploi - Votre réponse n\'a pas été prise en compte',
                    body: await render(organisme, options),
                },
            );
        },
    };
};
