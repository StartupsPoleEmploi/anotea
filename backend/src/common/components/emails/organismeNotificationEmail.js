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

    let build = async (organisme, readStatus, options = {}) => {
        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let params = {
            hostname: helper.getHostname(),
            consultationLink: helper.getPublicUrl(`/mail/${organisme.token}/nonLus`),
            trackingLink: helper.getTrackingLink(organisme.token),
            contact: helper.getRegionEmail(region),
            organisme: organisme,
            comment: readStatus.pickedComment ? readStatus.pickedComment.comment.text : null,
            ...options,
        };

        let [html, text] = await Promise.all([
            helper.templateHTML('organisme_avis_non_lus', params),
            helper.templateText('organisme_avis_non_lus', params),
        ]);

        return { html, text };
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
