let titleize = require('underscore.string/titleize');
let { delay } = require('../../../../job-utils');

class AvisMailer {

    constructor(db, logger, votreAvisEmail) {
        this.db = db;
        this.logger = logger;
        this.votreAvisEmail = votreAvisEmail;
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
                    this.logger.info(`Sending email to ${(trainee.trainee.email)} for campaign ${trainee.campaign}`);
                    await this.votreAvisEmail.send(trainee);

                    if (options.delay) {
                        await delay(options.delay);
                    }

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

module.exports = AvisMailer;
