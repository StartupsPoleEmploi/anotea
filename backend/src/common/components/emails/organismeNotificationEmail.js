const emailHelper = require('../../../smtp/emailHelper');
const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);
    let markEmailAsSent = organisme => {
        return db.collection('accounts').updateOne({ _id: organisme._id }, {
            $set: {
                newCommentsNotificationEmailSentDate: new Date(),
            }
        });
    };

    let build = (organisme, readStatus, options = {}) => {
        let region = regions.findRegionByCodeRegion(organisme.codeRegion);

        return helper.templates('organisme_avis_non_lus', {
            organisme: organisme,
            commentaire: readStatus.commentaire ? readStatus.commentaire : null,
            contact: helper.getRegionEmail(region),
            consultationLink: helper.getPublicUrl(`/mail/${organisme.token}/nonLus`),
            trackingLink: helper.getTrackingLink(organisme.token),
            ...options,
        });
    };

    return {
        build,
        send: async (organisme, readStatus) => {
            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let content = await build(organisme, readStatus, { webView: false });

            await mailer.sendNewEmail(getOrganismeEmail(organisme), region, {
                subject: `Pôle Emploi - Vous avez ${readStatus.nbUnreadComments} nouveaux avis stagiaires`,
                ...content,
            });
            await markEmailAsSent(organisme);
        },
    };
};
