let { delay } = require('../../../../job-utils');
let getOrganismeEmail = require('../../../../../common/utils/getOrganismeEmail');

class QuestionnaireOrganismeMailer {

    constructor(db, logger, mailer) {
        this.db = db;
        this.logger = logger;
        this.mailer = mailer;
    }

    _onSuccess(organisme) {
        return this.db.collection('accounts').updateOne({ '_id': organisme._id }, {
            $set: {
                'mailing.questionnaire.mailSent': true,
                'mailing.questionnaire.mailSentDate': new Date(),
            },
            $unset: {
                'mailing.questionnaire.mailError': '',
                'mailing.questionnaire.mailErrorDetail': ''
            },
            $inc: {
                'mailing.questionnaire.mailRetry': organisme.mailRetry >= 0 ? 1 : 0
            }
        });
    }

    _onError(err, organisme) {
        return this.db.collection('accounts').updateOne({ '_id': organisme._id }, {
            $set: {
                'mailing.questionnaire.mailSent': true,
                'mailing.questionnaire.mailError': 'smtpError',
                'mailing.questionnaire.mailErrorDetail': err.message
            }
        });
    }

    sendEmails(options = {}) {
        return new Promise(async (resolve, reject) => {

            let stats = {
                total: 0,
                sent: 0,
                error: 0,
            };

            let cursor = this.db.collection('accounts').find({
                'profile': 'organisme',
                'passwordHash': { $exists: true },
                'mailing.questionnaire.mailSent': { $exists: false },
            })
            .limit(options.limit || 1);

            while (await cursor.hasNext()) {
                stats.total++;
                let organisme = await cursor.next();
                let email = getOrganismeEmail(organisme);

                try {
                    this.logger.info(`Sending email to ${email}`);

                    await this.mailer.sendQuestionnaireOrganisme(email, organisme);

                    await this._onSuccess(organisme);

                    if (options.delay) {
                        await delay(options.delay);
                    }

                    stats.sent++;
                } catch (err) {
                    await this._onError(err, organisme);
                    stats.error++;
                    this.logger.error(err);
                }
            }

            return stats.error === 0 ? resolve(stats) : reject(stats);
        });
    }
}

module.exports = QuestionnaireOrganismeMailer;
