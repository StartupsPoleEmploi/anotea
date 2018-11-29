const moment = require('moment');

class ResendAction {

    constructor(db, configuration, filters = {}) {
        this.db = db;
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        let { relaunchDelay, maxRelaunch } = this.configuration.smtp.stagiaires;
        let activeRegions = this.configuration.app.active_regions
        .filter(region => region.jobs.send === true)
        .map(region => region.code_region);

        return {
            mailSent: true,
            unsubscribe: false,
            tracking: { $eq: null },
            mailSentDate: { $lte: moment().subtract(relaunchDelay, 'days').toDate() },
            ...(this.filters.codeRegion ? { codeRegion: this.filters.codeRegion } : { codeRegion: { $in: activeRegions } }),
            ...(this.filters.campaign ? { campaign: this.filters.campaign } : {}),
            $or: [{ mailRetry: { $eq: null } }, { mailRetry: { $lt: parseInt(maxRelaunch) } }]
        };
    }
}

module.exports = ResendAction;
