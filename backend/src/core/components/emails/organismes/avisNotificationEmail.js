module.exports = (db, regions, mailer) => {

    const templateName = 'avisNotificationEmail';

    let render = (organisme, comment) => {
        return mailer.render(__dirname, templateName, {
            organisme,
            comment,
        });
    };

    return {
        templateName,
        render,
        send: async (organisme, comment, nbUnreadComments) => {

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
                    subject: `Pôle Emploi - Vous avez ${nbUnreadComments || 'des'} nouveaux avis stagiaires`,
                    body: await render(organisme, comment),
                },
            )
            .then(onSuccess);
        },
    };
};
