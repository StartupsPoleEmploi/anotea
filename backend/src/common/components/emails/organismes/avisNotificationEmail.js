let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    const templateName = 'avisNotificationEmail';

    let render = (organisme, options = {}) => {
        return utils.render(__dirname, templateName, {
            organisme,
            ...utils.getOrganismeGlobals(templateName, organisme),
            ...options,
        });
    };

    return {
        templateName,
        render,
        send: async (organisme, options = {}) => {

            let onSuccess = () => {
                return db.collection('accounts').updateOne({ _id: organisme._id }, {
                    $set: {
                        newCommentsNotificationEmailSentDate: new Date(),
                    }
                });
            };

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);

            return mailer.createRegionalMailer(region).sendEmail(
                getOrganismeEmail(organisme),
                {
                    subject: `Pôle Emploi - Vous avez ${options.nbUnreadComments || 'des'} nouveaux avis stagiaires`,
                    body: await render(organisme, { webView: false, ...options }),
                },
            )
            .then(onSuccess);
        },
    };
};
