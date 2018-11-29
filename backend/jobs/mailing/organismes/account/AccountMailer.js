const getContactEmail = require('../../../../components/getContactEmail');
let { delay } = require('../../../utils');
const { getActiveRegionsForJob } = require('../../utils');

class AccountMailer {

    constructor(db, logger, configuration, mailer) {
        this.db = db;
        this.logger = logger;
        this.configuration = configuration;
        this.mailer = mailer;
    }

    _findOrganismes() {
        this.logger.debug('Searching organismes with at least one comment...');

        let activeRegions = getActiveRegionsForJob(this.configuration.app.active_regions, 'organismes.newAccount');

        return this.db.collection('organismes')
        .find({
            'passwordHash': null,
            'mailSentDate': null,
            'sources': { $ne: null },
            'meta.nbAvis': { $gte: 1 },
            'codeRegion': { $in: activeRegions },
        });
    }

    _sendEmail(organisme) {
        this.logger.debug('Sending email to', organisme);

        return new Promise((resolve, reject) => {
            this.mailer.sendOrganisationAccountLink({ to: getContactEmail(organisme) }, organisme, async () => {
                await this.db.collection('organismes').updateOne({ '_id': organisme._id }, {
                    $set: {
                        mailSentDate: new Date()
                    },
                    $unset: {
                        mailError: '',
                        mailErrorDetail: ''
                    },
                });
                resolve();
            }, err => reject(err));
        });
    }

    _handleSendError(organisme, error) {
        this.logger.error('Unable to send email: ', error);
        return this.db.collection('organismes').updateOne({ '_id': organisme._id }, {
            $set: {
                mailError: 'smtpError',
                mailErrorDetail: error
            }
        });
    }

    async sendEmails(options = {}) {
        let total = 0;
        let cursor = await this._findOrganismes();
        if (options.limit) {
            cursor.limit(options.limit);
        }

        while (await cursor.hasNext()) {
            let organisme = await cursor.next();
            try {
                await this._sendEmail(organisme);
                total++;
                if (options.delay) {
                    await delay(options.delay);
                }
            } catch (e) {
                await this._handleSendError(organisme, e);
            }
        }
        return {
            mailSent: total
        };
    }

    async sendEmailBySiret(siret) {
        let organisme = await this.db.collection('organismes').findOne({ 'meta.siretAsString': siret });
        try {
            await this._sendEmail(organisme);
        } catch (e) {
            await this._handleSendError(organisme, e);
        }
        return {
            mailSent: 1
        };
    }
}

module.exports = AccountMailer;
