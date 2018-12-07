const getContactEmail = require('../../../../components/getContactEmail');
let { delay } = require('../../../job-utils');

class AccountMailer {

    constructor(db, logger, configuration, mailer) {
        this.db = db;
        this.logger = logger;
        this.configuration = configuration;
        this.mailer = mailer;
    }

    _sendEmail(organisme) {
        return new Promise((resolve, reject) => {
            this.mailer.sendOrganisationAccountLink({ to: getContactEmail(organisme) }, organisme,
                async () => {
                    await this._onSuccess(organisme);
                    return resolve();
                }, async err => {
                    await this._onError(err, organisme);
                    return reject(err);
                });
        });
    }

    _onSuccess(organisme) {
        return this.db.collection('organismes').updateOne({ '_id': organisme._id }, {
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
        return this.db.collection('organismes').updateOne({ '_id': organisme._id }, {
            $set: {
                mailError: 'smtpError',
                mailErrorDetail: error.message
            }
        });
    }

    async sendEmails(action, options = {}) {
        let total = 0;
        let cursor = await this.db.collection('organismes').find(action.getQuery());
        if (options.limit) {
            cursor.limit(options.limit);
        }
        cursor.batchSize(10);

        while (await cursor.hasNext()) {
            let organisme = await cursor.next();
            this.logger.debug('Sending email to', organisme);

            total++;
            try {
                await this._sendEmail(organisme);

                if (options.delay) {
                    await delay(options.delay);
                }
            } catch (err) {
                this.logger.error(err);
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
            await this._onError(e, organisme);
        }
        return {
            mailSent: 1
        };
    }
}

module.exports = AccountMailer;
