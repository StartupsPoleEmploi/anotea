let { delay } = require('../../../job-utils');

class AccountMailer {

    constructor(db, logger, organismeAccountActivationEmail) {
        this.db = db;
        this.logger = logger;
        this.organismeAccountActivationEmail = organismeAccountActivationEmail;
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
                await this.organismeAccountActivationEmail.send(organisme);

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
            await this.organismeAccountActivationEmail.send(organisme);
            return { total: 1, sent: 1, error: 0 };
        } catch (e) {
            this.logger.error(e);
            return { total: 1, sent: 0, error: 1 };
        }
    }
}

module.exports = AccountMailer;
