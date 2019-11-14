const emailHelper = require('../../../smtp/emailHelper');
const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);

    let build = (organisme, comment, options = {}) => {

        let region = regions.findRegionByCodeRegion(organisme.codeRegion);

        return helper.templates('organisme_reponse_rejetee', {
            organisme,
            reponse: comment.reponse.text,
            contact: helper.getRegionEmail(region),
            trackingLink: helper.getTrackingLink(organisme.token),
            consultationLink: helper.getPublicUrl(`/mail/${organisme.token}/reponseRejetee/${comment.token}`),
            ...options,
        });
    };

    return {
        build,
        send: async (organisme, comment) => {

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let content = await build(organisme, comment, { webView: false });

            return mailer.sendNewEmail(getOrganismeEmail(organisme), region, {
                subject: `Pôle Emploi - votre réponse n'a pas été prise en compte`,
                ...content,
            });
        },
    };
};
