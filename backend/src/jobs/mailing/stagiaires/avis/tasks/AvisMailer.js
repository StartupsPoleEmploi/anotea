let titleize = require('underscore.string/titleize');
let { delay } = require('../../../../job-utils');

class AvisMailer {

    constructor(db, logger, mailer) {
        this.db = db;
        this.logger = logger;
        this.mailer = mailer;
    }

    _onSuccess(trainee) {
        return this.db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                mailSent: true,
                mailSentDate: new Date(),
            },
            $unset: {
                mailError: '',
                mailErrorDetail: ''
            },
            $inc: {
                mailRetry: trainee.mailRetry >= 0 ? 1 : 0
            }
        });
    }

    _onError(err, trainee) {
        return this.db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                mailSent: true,
                mailError: 'smtpError',
                mailErrorDetail: err.message
            }
        });
    }

    sendEmails(action, options = {}) {
        return new Promise(async (resolve, reject) => {

            let stats = {
                total: 0,
                sent: 0,
                error: 0,
            };

            let cursor = this.db.collection('trainee').find(action.getQuery());
            if (options.limit) {
                cursor.limit(options.limit);
            }

            while (await cursor.hasNext()) {
                stats.total++;
                const trainee = await cursor.next();
                trainee.trainee.firstName = titleize(trainee.trainee.firstName);
                trainee.trainee.name = titleize(trainee.trainee.name);

                try {
                    this.logger.info(`Sending email to ${trainee.trainee.email} for campaign ${trainee.campaign}`);
                    await this.mailer.sendVotreAvisMail({ to: trainee.trainee.email }, trainee);
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

module.exports = AvisMailer;
