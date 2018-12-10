class RetryAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        return {
            mailSent: true,
            unsubscribe: false,
            mailError: { $ne: null },
            ...(this.filters.codeRegions ? { codeRegion: { $in: this.filters.codeRegions } } : {}),
            ...(this.filters.campaign ? { campaign: this.filters.campaign } : {}),
            $or: [
                {
                    mailRetry: { $eq: null }
                },
                {
                    mailRetry: { $lt: parseInt(this.configuration.smtp.stagiaires.avisMaxRelaunch) }
                }
            ]
        };
    }
}

module.exports = RetryAction;

