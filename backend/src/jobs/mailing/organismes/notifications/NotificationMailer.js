const moment = require('moment');
const getOrganismeEmail = require('../../../../common/utils/getOrganismeEmail');
let { delay } = require('../../../job-utils');

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

        return this.db.collection('accounts')
        .aggregate([
            {
                $match: {
                    'profile': 'organisme',
                    'passwordHash': { $ne: null },
                    ...(codeRegions ? { 'codeRegion': { $in: codeRegions } } : {}),
                    '$or': [
                        { 'newCommentsNotificationEmailSentDate': { $lte: moment().subtract(delay, 'days').toDate() } },
                        { 'newCommentsNotificationEmailSentDate': null },
                    ]
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        organisme: '$$ROOT',
                    }
                }
            },
            {
                $lookup: {
                    from: 'comment',
                    let: {
                        siret: '$organisme.meta.siretAsString',
                    },
                    pipeline: [
                        {
                            $match: {
                                comment: { $ne: null },
                                read: false,
                                status: 'published',
                                $expr: {
                                    $eq: ['$training.organisation.siret', '$$siret'],
                                },
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                pickedComment: { $first: '$$ROOT' },
                                nbUnreadComments: { $sum: 1 }
                            }
                        },
                    ],
                    as: 'status'
                }
            },
            {
                $unwind: {
                    path: '$status',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $match: {
                    'status.nbUnreadComments': { $gte: 5 }
                }
            }
        ]);
    }

    _markEmailAsSent(organisme) {
        return this.db.collection('accounts').updateOne({ _id: organisme._id }, {
            $set: {
                newCommentsNotificationEmailSentDate: new Date(),
            }
        });
    }

    async _sendEmail(organisme, status) {
        return new Promise(async (resolve, reject) => {
            let data = {
                organisme,
                pickedComment: status.pickedComment,
                nbUnreadComments: status.nbUnreadComments
            };
            this.mailer.sendNewCommentsNotification({ to: getOrganismeEmail(organisme) }, data, () => resolve(), err => reject(err));
        });
    }

    async sendEmails(options = {}) {
        let stats = {
            total: 0,
            sent: 0,
            error: 0,
        };
        let cursor = await this._findOrganismes(options.codeRegions);
        if (options.limit) {
            cursor.limit(options.limit);
        }
        cursor.batchSize(10);

        while (await cursor.hasNext()) {
            let { organisme, status } = await cursor.next();
            stats.total++;
            try {
                this.logger.info(`Sending email to ${organisme.courriel}`);
                await this._sendEmail(organisme, status);
                await this._markEmailAsSent(organisme);
                if (options.delay) {
                    await delay(options.delay);
                }
                stats.sent++;
            } catch (e) {
                this.logger.error('Unable to send email: ', e);
                stats.error++;
            }
        }
        return stats;
    }

}

module.exports = NotificationMailer;
