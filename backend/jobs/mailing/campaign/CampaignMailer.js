let titleize = require('underscore.string/titleize');

class CampaignMailer {

    constructor(db, logger, mailer) {
        this.db = db;
        this.logger = logger;
        this.mailer = mailer;
    }

    onSuccess(trainee) {
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
                mailRetry: trainee.mailRetry ? 1 : 0
            }
        });
    }

    onError(err, trainee) {
        return this.db.collection('trainee').updateOne({ '_id': trainee._id }, {
            $set: {
                mailSent: true,
                mailError: 'smtpError',
                mailErrorDetail: err.message
            }
        });
    }

    sendEmails(handler, options = {}) {
        return new Promise(async (resolve, reject) => {

            let stats = {
                total: 0,
                sent: 0,
                error: 0,
            };

            let cursor = this.db.collection('trainee').find(handler.getQuery());
            if (options.limit) {
                cursor.limit(options.limit);
            }

            while (await cursor.hasNext()) {
                stats.total++;
                const trainee = await cursor.next();
                trainee.trainee.firstName = titleize(trainee.trainee.firstName);
                trainee.trainee.name = titleize(trainee.trainee.name);

                try {
                    await new Promise((resolve, reject) => {
                        this.mailer.sendVotreAvisMail({ to: trainee.trainee.email }, trainee,
                            async () => {
                                await this.onSuccess(trainee);
                                return resolve();
                            }, async err => {
                                await this.onError(err, trainee);
                                return reject(err);
                            });
                    });
                    stats.sent++;
                } catch (err) {
                    stats.error++;
                    this.logger.error(err);
                }
            }

            return stats.error === 0 ? resolve(stats) : reject(stats);
        });
    }
}

module.exports = CampaignMailer;
