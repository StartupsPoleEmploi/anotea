const moment = require('moment');
const path = require('path');
const ejs = require('ejs');
const { promisify } = require('util');
const renderFile = promisify(ejs.renderFile);

module.exports = configuration => {
    let hostname = configuration.app.public_hostname;

    let getPublicUrl = path => `${hostname}${path}`;

    let renderHTML = (templateName, params) => {
        return renderFile(path.join(__dirname, `${templateName}.ejs`), { ...params, utils: { moment, getPublicUrl } });
    };
    let renderText = (templateName, params) => {
        return renderFile(path.join(__dirname, `${templateName}.txt`), { ...params, utils: { moment, getPublicUrl } });
    };

    let getRegionEmail = region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from;

    return {
        getPublicUrl,
        getRegionEmail,
        getTrackingLink: token => getPublicUrl(`/mail/${token}/track`),
        getUnsubscribeLink: token => getPublicUrl(`/mail/${token}/unsubscribe`),
        getUTM: campaign => `utm_source=PE&utm_medium=mail&utm_campaign=${campaign}`,
        render: async (templateName, params, options = {}) => {

            if (options.textOnly) {
                return { text: await renderText(templateName, params) };
            }

            let [html, text] = await Promise.all([
                renderHTML(templateName, params),
                renderText(templateName, params),
            ]);

            return { html, text };
        },
    };
};
