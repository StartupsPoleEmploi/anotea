const moment = require('moment');

class ResendAction {

    constructor(configuration, filters = {}) {
        this.configuration = configuration;
        this.filters = filters;
    }

    getQuery() {
        let { avisRelaunchDelay, avisMaxRelaunch } = this.configuration.smtp.stagiaires;

        return {
            mailSent: true,
            unsubscribe: false,
            avisCreated: false,
            $and: [
                { mailSentDate: { $lte: moment().subtract(avisRelaunchDelay, 'days').toDate() } },
                { mailSentDate: { $gte: moment().subtract(6, 'months').toDate() } },
            ],
            ...(this.filters.codeRegions ? { codeRegion: { $in: this.filters.codeRegions } } : {}),
            ...(this.filters.campaign ? { campaign: this.filters.campaign } : {}),
            $or: [
                { mailRetry: { $eq: null } },
                { mailRetry: { $lt: parseInt(avisMaxRelaunch) } }
            ]
        };
    }
}

module.exports = ResendAction;
