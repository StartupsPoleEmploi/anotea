let { delay } = require('../../../../job-utils');

class Questionnaire6MoisMailer {

    constructor(db, logger, mailer) {
        this.db = db;
        this.logger = logger;
        this.mailer = mailer;
    }

    _onSuccess(trainee) {
        return this.db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                'mailing.questionnaire6Mois.mailSent': true,
                'mailing.questionnaire6Mois.mailSentDate': new Date(),
            },
            $unset: {
                'mailing.questionnaire6Mois.mailError': '',
                'mailing.questionnaire6Mois.mailErrorDetail': ''
            },
            $inc: {
                'mailing.questionnaire6Mois.mailRetry': trainee.mailRetry >= 0 ? 1 : 0
            }
        });
    }

    _onError(err, trainee) {
        return this.db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                'mailing.questionnaire6Mois.mailSent': true,
                'mailing.questionnaire6Mois.mailError': 'smtpError',
                'mailing.questionnaire6Mois.mailErrorDetail': err.message
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

            let cursor = this.db.collection('trainee').aggregate([
                {
                    $match: {
                        'mailing.questionnaire6Mois.mailSent': { $exists: false },
                        'campaign': 'STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05',
                        '$or': [
                            { 'training.certifInfo.id': { $ne: 'NULL' } },
                            { 'training.certifInfo.id': { $ne: '' } }
                        ],
                    }
                },
                {
                    $group: {
                        _id: '$trainee.email',
                        trainee: { $first: '$$ROOT' },
                    }
                }
            ])
            .limit(options.limit || 1);

            while (await cursor.hasNext()) {
                stats.total++;
                let { trainee } = await cursor.next();

                try {
                    this.logger.info(`Sending email to ${trainee.trainee.email}`);

                    await new Promise((resolve, reject) => {
                        let mailOptions = { to: trainee.trainee.email };
                        this.mailer.sendQuestionnaire6MoisMail(mailOptions, trainee, () => resolve(), err => reject(err));
                    });

                    await this._onSuccess(trainee);

                    if (options.delay) {
                        await delay(options.delay);
                    }

                    stats.sent++;
                } catch (err) {
                    await this._onError(err, trainee);
                    stats.error++;
                    this.logger.error(err);
                }
            }

            return stats.error === 0 ? resolve(stats) : reject(stats);
        });
    }
}

module.exports = Questionnaire6MoisMailer;
