const path = require('path');
const ejs = require('ejs');
const { promisify } = require('util');
const renderFile = promisify(ejs.renderFile);

module.exports = configuration => {
    let hostname = configuration.app.public_hostname;

    return {
        getHostname: () => hostname,
        getPublicUrl: path => `${hostname}/${path}`,
        getTrackingLink: obj => `${hostname}/mail/${obj.token}/track`,
        getRegionEmail: region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from,
        templateHTML: (template, params) => renderFile(path.join(__dirname, `views/${template}.ejs`), params),
        templateText: (template, params) => renderFile(path.join(__dirname, `views/${template}.txt`), params),
    };
};
