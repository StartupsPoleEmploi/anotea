module.exports = (db, regions, mailer, templates) => {

    return (organisme, readStatus) => {
        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);

        let render = (options = {}) => {
            return templates.render('nouveaux_avis_notification', {
                organisme: organisme,
                commentaire: readStatus.commentaire ? readStatus.commentaire : null,
                contact: templates.getRegionEmail(region),
                consultationLink: templates.getPublicUrl(`/mail/${organisme.token}/nonLus`),
                trackingLink: templates.getTrackingLink(organisme.token),
                ...options,
            });
        };

        let onSuccess = () => {
            return db.collection('accounts').updateOne({ _id: organisme._id }, {
                $set: {
                    newCommentsNotificationEmailSentDate: new Date(),
                }
            });
        };

        return {
            render,
            send: async emailAddress => {
                return regionalMailer.sendEmail(
                    emailAddress,
                    {
                        subject: `Pôle Emploi - Vous avez ${readStatus.nbUnreadComments} nouveaux avis stagiaires`,
                        body: await render({ webView: false }),
                    },
                )
                .then(onSuccess);
            },
        };
    };
};
