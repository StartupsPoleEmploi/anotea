const moment = require('moment');

class ResendAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        let delay = this.configuration.smtp.organisme.accountsRelaunchDelay;

        return {
            'meta.nbAvis': { $gte: 1 },
            '$and': [
                { mailSentDate: { $ne: null } },
                { mailSentDate: { $lte: moment().subtract(delay, 'days').toDate() } },
            ],
            'passwordHash': null,
            'resend': { $ne: true },
            ...(this.filters.codeRegions ? { 'codeRegion': { $in: this.filters.codeRegions } } : {}),
        };
    }
}

module.exports = ResendAction;
