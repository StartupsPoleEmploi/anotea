module.exports = (db, regions, mailer, templates) => {

    return (organisme, comment) => {

        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);

        let render = (options = {}) => {
            return templates.render('avis_reported_confirmed', {
                organisme,
                commentaire: comment.comment.text,
                trackingLink: templates.getTrackingLink(organisme.token),
                consultationLink: templates.getPublicUrl(`/mail/${organisme.token}/signalementAccepte/${comment.token}`),
                ...options,
            });
        };

        return {
            render,
            send: async emailAddress => {
                let body = await render({ webView: false });
                return regionalMailer.sendEmail(
                    emailAddress,
                    {
                        subject: 'Pôle Emploi - Avis signalé dans votre Espace Anotéa',
                        body,
                    },
                );
            },
        };
    };
};
