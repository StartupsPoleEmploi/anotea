const moment = require('moment');
const getContactEmail = require('../../../../components/getContactEmail');
let { delay } = require('../../../utils');

class ResendAccountMailer {

    constructor(db, logger, configuration, mailer) {
        this.db = db;
        this.logger = logger;
        this.configuration = configuration;
        this.mailer = mailer;
    }

    async _findOrganismes() {
        this.logger.debug('Searching organismes with at least one comment that didn\'t create an account yet...');
        let delay = this.configuration.smtp.organisme.newAccountRelaunchDelay;

        return await this.db.collection('organismes')
        .find({
            'meta.nbAvis': { $gte: 1 },
            '$and': [
                { mailSentDate: { $ne: null } },
                { mailSentDate: { $lte: moment().subtract(delay, 'days').toDate() } },
            ],
            'passwordHash': null,
            'resend': { $ne: true }
        })
        .sort({ mailSentDate: -1 });
    }

    _sendEmail(organisme) {
        this.logger.debug('Resending email to', organisme);

        return new Promise((resolve, reject) => {
            this.mailer.sendOrganisationAccountLink({ to: getContactEmail(organisme) }, organisme, async () => {
                await this.db.collection('organismes').updateOne({ '_id': organisme._id }, {
                    $set: {
                        mailSentDate: new Date(),
                        resent: true
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

    async resendEmails(options={}) {
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
}

module.exports = ResendAccountMailer;
