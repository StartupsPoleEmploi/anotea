const moment = require('moment');
const path = require('path');
const mjml = require('mjml');
const ejs = require('ejs');
const { promisify } = require('util');
const renderFile = promisify(ejs.renderFile);

module.exports = (configuration, regions) => {

    let getPublicUrl = path => `${(configuration.app.public_hostname)}${path}`;

    let utils = {
        getPublicUrl,
        getUTM: campaign => `utm_source=PE&utm_medium=mail&utm_campaign=${campaign}`,
        getRegionEmail: region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from,
        getUnsubscribeLink: token => getPublicUrl(`/emails/stagiaires/${token}/unsubscribe`),
        getConsultationLink: (type, templateName, token, commentToken) => {
            const params = commentToken ? `?avis=${commentToken}` : '';
            return getPublicUrl(`/emails/${type}/${token}/templates/${templateName}${params}`);
        },
    };

    return {
        ...utils,
        render: async (rootDir, templateName, data = {}) => {
            let doc = (data.account || data.organisme || data.trainee);
            let mjmlTemplate = await renderFile(path.join(rootDir, `${templateName}.mjml.ejs`), {
                ...data,
                ...(doc ? { region: regions.findRegionByCodeRegion(doc.codeRegion) } : {}),
                templateName,
                utils: { moment, ...utils },
            });
            return mjml(mjmlTemplate, { minify: true }).html;
        },
    };
};
