class SendAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        return {
            "profile": "organisme",
            "courriel": { $ne: null },
            "passwordHash": null,
            "mailSentDate": null,
            "sources": { $ne: null },
            "score.nb_avis": { $gte: 1 },
            ...(this.filters.codeRegions ? { "codeRegion": { $in: this.filters.codeRegions } } : {}),
        };
    }
}

module.exports = SendAction;
