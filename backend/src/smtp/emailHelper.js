const moment = require('moment');
const path = require('path');
const ejs = require('ejs');
const { promisify } = require('util');
const renderFile = promisify(ejs.renderFile);

module.exports = configuration => {
    let hostname = configuration.app.public_hostname;

    let templateHTML = (template, params) => {
        return renderFile(path.join(__dirname, `views/${template}.ejs`), { ...params, moment, hostname });
    };
    let templateText = (template, params) => {
        return renderFile(path.join(__dirname, `views/${template}.txt`), { ...params, moment, hostname });
    };

    return {
        getPublicUrl: path => `${hostname}${path}`,
        getTrackingLink: token => `${hostname}/mail/${token}/track`,
        getRegionEmail: region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from,
        templates: async (templateName, params, options = {}) => {

            if (options.textOnly) {
                return { text: await templateText(templateName, params) };
            }

            let [html, text] = await Promise.all([
                templateHTML(templateName, params),
                templateText(templateName, params),
            ]);

            return { html, text };
        },
    };
};
