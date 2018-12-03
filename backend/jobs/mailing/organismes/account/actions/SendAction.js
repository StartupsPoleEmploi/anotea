class SendAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        return {
            'passwordHash': null,
            'mailSentDate': null,
            'sources': { $ne: null },
            'meta.nbAvis': { $gte: 1 },
            ...(this.filters.codeRegions ? { 'codeRegion': { $in: this.filters.codeRegions } } : {}),
        };
    }
}

module.exports = SendAction;
