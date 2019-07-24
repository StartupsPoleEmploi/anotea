class SendAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        return {
            'sourceIDF': null,
            'mailSent': false,
            'unsubscribe': false,
            'training.organisation.siret': { $ne: '' },
            'training.scheduledEndDate': { $lte: new Date() },
            ...(this.filters.codeRegions ? { 'codeRegion': { $in: this.filters.codeRegions } } : {}),
            ...(this.filters.campaign ? { 'campaign': this.filters.campaign } : {}),
        };
    }
}

module.exports = SendAction;
