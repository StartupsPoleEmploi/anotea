let getOrganismeEmail = require('../../../utils/getOrganismeEmail');

module.exports = (db, regions, mailer, utils) => {

    const templateName = 'avisNotificationEmail';

    let render = (organisme, readStatus, options = {}) => {
        return utils.render(__dirname, templateName, {
            organisme,
            commentaire: readStatus.commentaire ? readStatus.commentaire : null,
            ...utils.getOrganismeGlobals(templateName, organisme),
            ...options,
        });
    };

    return {
        templateName,
        render,
        send: async (organisme, readStatus) => {

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
                    subject: `Pôle Emploi - Vous avez ${readStatus.nbUnreadComments} nouveaux avis stagiaires`,
                    body: await render(organisme, readStatus, { webView: false }),
                },
            )
            .then(onSuccess);
        },
    };
};
