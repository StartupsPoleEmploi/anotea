const emailHelper = require('../../../smtp/emailHelper');
const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);

    let build = async (organisme, comment, options = {}) => {

        let region = regions.findRegionByCodeRegion(organisme.codeRegion);
        let params = {
            hostname: helper.getHostname(),
            trackingLink: helper.getTrackingLink(organisme.token),
            consultationLink: helper.getPublicUrl(`/mail/${organisme.token}/reponseRejetee/${comment.token}`),
            contact: helper.getRegionEmail(region),
            organisme,
            reponse: comment.reponse.text,
            ...options,
        };

        let [html, text] = await Promise.all([
            helper.templateHTML('organisme_reponse_rejetee', params),
            helper.templateText('organisme_reponse_rejetee', params),
        ]);

        return { html, text };
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
