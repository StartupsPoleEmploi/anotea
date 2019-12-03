const moment = require('moment');
const path = require('path');
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
        render: (dir, templateName, data) => renderFile(path.join(dir, `${templateName}.ejs`), data),
        getStagiaireGlobals: (templateName, trainee) => {
            let token = trainee.token;
            let region = regions.findRegionByCodeRegion(trainee.codeRegion);
            let utm = utils.getUTM(trainee.campaign);

            return {
                region,
                utils: { moment, ...utils },
                analytics: configuration.analytics,
                unsubscribeLink: utils.getUnsubscribeLink(token),
                trackingLink: utils.getPublicUrl(`/mail/stagiaires/${token}/track`),
                consultationLink: utils.getPublicUrl(`/mail/stagiaires/${token}/templates/${templateName}?${(utm)}`),
            };
        },
        getOrganismeGlobals: (templateName, organisme) => {
            let region = regions.findRegionByCodeRegion(organisme.codeRegion);
            let token = organisme.token;

            return {
                region,
                utils: { moment, ...utils },
                analytics: configuration.analytics,
                trackingLink: utils.getPublicUrl(`/mail/organismes/${token}/track`),
                consultationLink: utils.getPublicUrl(`/mail/organismes/${token}/templates/${templateName}`),
            };
        },
        getAccountGlobals: (templateName, account) => {
            let region = regions.findRegionByCodeRegion(account.codeRegion);

            return {
                region,
                utils: { moment, ...utils },
                analytics: configuration.analytics,
            };
        },
    };
};
