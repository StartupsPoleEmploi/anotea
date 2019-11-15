module.exports = (db, regions, mailer, templates) => {

    return trainee => {

        let region = regions.findRegionByCodeRegion(trainee.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);
        let token = trainee.token;
        let unsubscribeLink = templates.getUnsubscribeLink(token);

        let render = (options = {}) => {
            return templates.render('avis_rejected_alerte', {
                trainee,
                unsubscribeLink: unsubscribeLink,
                consultationLink:
                    templates.getPublicUrl(`/mail/${token}/injure?${templates.getUTM(trainee.campaign)}`),
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
                        subject: 'Nous avons bien pris en compte votre commentaire',
                        body,
                    },
                    {
                        list: {
                            unsubscribe: unsubscribeLink,
                        },
                    }
                );
            },
        };
    };
};
