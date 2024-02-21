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

            return mailer.createRegionalMailer(region).sendEmail(
                organisme.courriel,
                {
                    subject: `France Travail - Vous avez ${nbUnreadCommentaires || 'des'} nouveaux avis stagiaires`,
                    body: await render(organisme, avis),
                },
            )
            .then(onSuccess);
        },
    };
};
