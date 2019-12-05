const moment = require('moment');
const path = require('path');
const mjml = require('mjml');
const ejs = require('ejs');
const { promisify } = require('util');
const renderFile = promisify(ejs.renderFile);

module.exports = (configuration, regions) => {

    let utils = {
        getPublicUrl: path => `${(configuration.app.public_hostname)}${path}`,
        getUnsubscribeLink: token => `${(configuration.app.public_hostname)}/mail/stagiaires/${token}/unsubscribe`,
        getUTM: campaign => `utm_source=PE&utm_medium=mail&utm_campaign=${campaign}`,
        getRegionEmail: region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from,
    };

    return {
        ...utils,
        render: async (dir, templateName, data) => {
            let mjmlTemplate = await renderFile(path.join(dir, `${templateName}.mjml.ejs`), {
                ...data,
                templateName,
                utils: { moment, ...utils },
                region: regions.findRegionByCodeRegion((data.account || data.organisme || data.trainee).codeRegion),
            });
            return mjml(mjmlTemplate, { minify: true }).html;
        },
    };
};
