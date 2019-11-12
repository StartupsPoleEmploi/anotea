const emailHelper = require('../../../smtp/emailHelper');
const getOrganismeEmail = require('../../utils/getOrganismeEmail');

module.exports = (db, mailer, configuration, regions) => {

    let helper = emailHelper(configuration);

    let build = async (organisme, comment, options = {}) => {

        let params = {
            hostname: helper.getHostname(),
            trackingLink: helper.getTrackingLink(organisme.token),
            consultationLink: `${configuration.app.public_hostname}/mail/${organisme.token}/reponseRejetee/${avis.token}`,
            avis: comment.comment.text,
            organisme,
            ...options,
        };

        let [html, text] = await Promise.all([
            helper.templateHTML('organisme_avis_signale_publie', params),
            helper.templateText('organisme_avis_signale_publie', params),
        ]);

        return { html, text };
    };

    return {
        build,
        send: async (organisme, comment) => {

            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let content = await build(organisme, comment, { webView: false });

            return mailer.sendNewEmail(getOrganismeEmail(organisme), region, {
                subject: `Pôle Emploi - avis signalé dans votre Espace Anotéa`,
                ...content,
            });
        },
    };
};
