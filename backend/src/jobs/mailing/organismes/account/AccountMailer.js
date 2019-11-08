const getOrganismeEmail = require('../../../../common/utils/getOrganismeEmail');
let { delay } = require('../../../job-utils');

class AccountMailer {

    constructor(db, logger, configuration, mailer) {
        this.db = db;
        this.logger = logger;
        this.configuration = configuration;
        this.mailer = mailer;
    }

    _sendEmail(organisme) {
        return this.mailer.sendOrganisationAccountEmail({ to: getOrganismeEmail(organisme) }, organisme)
        .then(() => this._onSuccess(organisme))
        .catch(err => this._onError(err, organisme));
    }

    _onSuccess(organisme) {
        return this.db.collection('accounts').updateOne({ '_id': organisme._id }, {
            $set: {
                mailSentDate: new Date(),
                resend: !!organisme.mailSentDate,
            },
            $unset: {
                mailError: '',
                mailErrorDetail: ''
            },
        });
    }

    _onError(error, organisme) {
        return this.db.collection('accounts').updateOne({ '_id': organisme._id }, {
            $set: {
                mailError: 'smtpError',
                mailErrorDetail: error.message
            }
        });
    }

    async sendEmails(action, options = {}) {
        let stats = {
            total: 0,
            sent: 0,
            error: 0,
        };
        let cursor = await this.db.collection('accounts').find(action.getQuery());
        if (options.limit) {
            cursor.limit(options.limit);
        }
        cursor.batchSize(10);

        while (await cursor.hasNext()) {
            let organisme = await cursor.next();
            this.logger.debug('Sending email to', organisme);

            stats.total++;
            try {
                await this._sendEmail(organisme);

                if (options.delay) {
                    await delay(options.delay);
                }
                stats.sent++;
            } catch (err) {
                this.logger.error(err);
                stats.error++;
            }
        }
        return stats;
    }

    async sendEmailBySiret(siret) {
        let organisme = await this.db.collection('accounts').findOne({ 'meta.siretAsString': siret });
        try {
            await this._sendEmail(organisme);
            return { total: 1, sent: 1, error: 0 };
        } catch (e) {
            await this._onError(e, organisme);
            this.logger.error(e);
            return { total: 1, sent: 0, error: 1 };
        }
    }
}

module.exports = AccountMailer;
