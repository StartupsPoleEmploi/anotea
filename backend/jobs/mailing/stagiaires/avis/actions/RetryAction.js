class RetryAction {

    constructor(db, configuration, filters = {}) {
        this.db = db;
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        let activeRegions = this.configuration.app.active_regions
        .filter(region => region.jobs.send === true)
        .map(region => region.code_region);

        return {
            mailSent: true,
            unsubscribe: false,
            mailError: { $ne: null },
            ...(this.filters.codeRegion ? { codeRegion: this.filters.codeRegion } : { codeRegion: { $in: activeRegions } }),
            ...(this.filters.campaign ? { campaign: this.filters.campaign } : {}),
            $or: [
                {
                    mailRetry: { $eq: null }
                },
                {
                    mailRetry: { $lt: parseInt(this.configuration.smtp.stagiaires.maxRelaunch) }
                }
            ]
        };
    }
}

module.exports = RetryAction;

