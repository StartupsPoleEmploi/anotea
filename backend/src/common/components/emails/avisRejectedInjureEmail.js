module.exports = (db, regions, mailer, templates) => {

    return trainee => {

        let region = regions.findRegionByCodeRegion(trainee.codeRegion);
        let regionalMailer = mailer.createRegionalMailer(region);
        let token = trainee.token;
        let unsubscribeLink = templates.getUnsubscribeLink(token);

        let render = (options = {}) => {
            return templates.render(`avis_rejected_injure`, {
                trainee,
                contact: templates.getRegionEmail(region),
                unsubscribeLink: unsubscribeLink,
                consultationLink:
                    templates.getPublicUrl(`/mail/${token}/injure?${templates.getUTM(trainee.campaign)}`),
                ...options,
            });
        };

        return {
            render,
            send: async emailAddress => {

                let training = trainee.training;
                let body = await render({ webView: false });

                return regionalMailer.sendEmail(
                    emailAddress,
                    {
                        subject: `Rejet de votre avis sur votre formation ${training.title} à ${training.organisation.name}`,
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
