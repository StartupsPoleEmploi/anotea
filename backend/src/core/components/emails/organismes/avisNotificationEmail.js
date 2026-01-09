module.exports = (db, regions, mailer) => {

    const templateName = 'avisNotificationEmail';

    let render = (organisme, avis) => {
        return mailer.render(__dirname, templateName, {
            organisme,
            avis,
        });
    };

    return {
        templateName,
        render,
        send: async (organisme, avis, nbUnreadCommentaires) => {

            let onSuccess = () => {
                return db.collection('accounts').updateOne({ _id: organisme._id }, {
                    $set: {
                        newCommentsNotificationEmailSentDate: new Date(),
                    }
                });
            };

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);

            return mailer.createRegionalMailerV2(region).sendEmail(
                organisme.courriel,
                {
                    codeMessage: 'ANOTEA_ORGANISME_NOTIF_AVIS',
                    organismeToken: organisme.token,
                    siret: organisme.siret,
                    texteAvis: avis?.commentaire?.text,
                    nbUnreadCommentaires: nbUnreadCommentaires,
                },
            )
            .then(onSuccess);
        },
    };
};
