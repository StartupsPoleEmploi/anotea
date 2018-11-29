const moment = require('moment');

class ResendAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        let { relaunchDelay, maxRelaunch } = this.configuration.smtp.stagiaires;

        return {
            mailSent: true,
            unsubscribe: false,
            tracking: { $eq: null },
            mailSentDate: { $lte: moment().subtract(relaunchDelay, 'days').toDate() },
            ...(this.filters.codeRegions ? { codeRegion: { $in: this.filters.codeRegions } } : {}),
            ...(this.filters.campaign ? { campaign: this.filters.campaign } : {}),
            $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(maxRelaunch) } }]
        };
    }
}

module.exports = ResendAction;
