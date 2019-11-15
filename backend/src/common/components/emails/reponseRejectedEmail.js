module.exports = (db, regions, mailer, templates) => {

    return (organisme, comment) => {

        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);

        let render = (options = {}) => {
            return templates.render('reponse_rejected', {
                organisme,
                reponse: comment.reponse.text,
                contact: templates.getRegionEmail(region),
                trackingLink: templates.getTrackingLink(organisme.token),
                consultationLink: templates.getPublicUrl(`/mail/${organisme.token}/reponseRejetee/${comment.token}`),
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
                        subject: 'Pôle Emploi - votre réponse n\'a pas été prise en compte',
                        body,
                    },
                );
            },
        };
    };
};
