const { getActiveRegionsForJob } = require('../../../utils');

class SendAction {

    constructor(db, configuration, filters = {}) {
        this.db = db;
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        let activeRegions = getActiveRegionsForJob(this.configuration.app.active_regions, 'stagiaires.send');

        return {
            'sourceIDF': null,
            'mailSent': false,
            'unsubscribe': false,
            'training.organisation.siret': { $ne: '' },
            'training.scheduledEndDate': { $lte: new Date() },
            ...(this.filters.codeRegion ? { 'codeRegion': this.filters.codeRegion } : { 'codeRegion': { $in: activeRegions } }),
            ...(this.filters.campaign ? { 'campaign': this.filters.campaign } : {}),
        };
    }
}

module.exports = SendAction;
