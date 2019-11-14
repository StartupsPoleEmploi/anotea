let { delay } = require('../../../../job-utils');
let getOrganismeEmail = require('../../../../../common/utils/getOrganismeEmail');
let emailHelper = require('../../../../../smtp/emailHelper');

class QuestionnaireOrganismeMailer {

    constructor(db, logger, configuration, mailer, regions) {
        this.db = db;
        this.logger = logger;
        this.helper = emailHelper(configuration);
        this.mailer = mailer;
        this.regions = regions;
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

    async sendEmail(organisme) {
        let region = this.regions.findRegionByCodeRegion(organisme.codeRegion);

        let [html, text] = await this.helper.templates('organisme_questionnaire', {
            hostname: this.helper.getHostname(),
            formLink: 'https://avril_la_vae_facile.typeform.com/to/X4oxTv',
            consultationLink: this.helper.getPublicUrl(`/mail/${organisme.token}/organisme_questionnaire?utm_source=PE&utm_medium=mail`),
            organisme,
        });

        return this.mailer.sendNewEmail(getOrganismeEmail(organisme), region, {
            subject: 'Aidez-nous à améliorer Anotéa',
            html,
            text
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

                    await this.sendEmail(organisme);

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
