const moment = require('moment');
const getContactEmail = require('../../../../components/getContactEmail');
let { delay } = require('../../../utils');

class NotificationMailer {

    constructor(db, logger, configuration, mailer) {
        this.db = db;
        this.logger = logger;
        this.configuration = configuration;
        this.mailer = mailer;
    }

    _findOrganismes(codeRegions) {
        this.logger.info('Searching organismes with at least 5 non read comments...');
        let delay = this.configuration.smtp.organisme.notificationsRelaunchDelay;

        return this.db.collection('organismes')
        .find({
            'meta.nbAvis': { $gte: 5 },
            ...(codeRegions ? { 'codeRegion': { $in: codeRegions } } : {}),
            '$or': [
                { 'newCommentsNotificationEmailSentDate': { $lte: moment().subtract(delay, 'days').toDate() } },
                { 'newCommentsNotificationEmailSentDate': null },
            ]
        });
    }

    _getFirstUnreadComment(organisme) {
        return this.db.collection('comment').findOne({
            'training.organisation.siret': organisme.meta.siretAsString,
            'comment': { $ne: null },
            'read': { $ne: true },
            'published': true
        });
    }

    _markEmailAsSent(organisme) {
        return this.db.collection('organismes').updateOne({ _id: organisme._id }, {
            $set: {
                newCommentsNotificationEmailSentDate: new Date(),
            }
        });
    }

    _sendEmail(organisme) {
        return new Promise(async (resolve, reject) => {
            let data = {
                organisme,
                comment: await this._getFirstUnreadComment(organisme),
            };
            this.mailer.sendNewCommentsNotification({ to: getContactEmail(organisme) }, data, () => resolve(), err => reject(err));
        });
    }

    async sendEmails(options = {}) {
        let total = 0;
        let cursor = await this._findOrganismes(options.codeRegions);
        if (options.limit) {
            cursor.limit(options.limit);
        }

        while (await cursor.hasNext()) {
            let organisme = await cursor.next();
            try {
                this.logger.info(`Sending email to ${organisme.courriel}`);
                await this._sendEmail(organisme);
                await this._markEmailAsSent(organisme);
                if (options.delay) {
                    await delay(options.delay);
                }
                total++;
            } catch (e) {
                this.logger.error('Unable to send email: ', e);
            }
        }
        return {
            mailSent: total
        };
    }

}

module.exports = NotificationMailer;
