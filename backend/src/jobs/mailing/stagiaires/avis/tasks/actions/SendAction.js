class SendAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        return {
            'sourceIDF': null,
            'mailSent': false,
            'avisCreated': false,
            'unsubscribe': false,
            'formation.action.organisme_formateur.siret': { $ne: '' },
            'formation.action.session.periode.fin': { $lte: new Date() },
            ...(this.filters.codeRegions ? { 'codeRegion': { $in: this.filters.codeRegions } } : {}),
            ...(this.filters.campaign ? { 'campaign': this.filters.campaign } : {}),
            'formation.action.session.nbStagiaires': { $gte: 5 },
        };
    }
}

module.exports = SendAction;
