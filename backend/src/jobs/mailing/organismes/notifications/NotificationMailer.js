const moment = require('moment');
let { delay } = require('../../../job-utils');

class NotificationMailer {

    constructor(db, logger, configuration, organismeNotificationEmail) {
        this.db = db;
        this.logger = logger;
        this.configuration = configuration;
        this.organismeNotificationEmail = organismeNotificationEmail;
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
                                status: 'validated',
                                $expr: {
                                    $eq: ['$training.organisation.siret', '$$siret'],
                                },
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                commentaire: { $first: 'comment.text' },
                                nbUnreadComments: { $sum: 1 }
                            }
                        },
                    ],
                    as: 'readStatus'
                }
            },
            {
                $unwind: {
                    path: '$readStatus',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $match: {
                    'readStatus.nbUnreadComments': { $gte: 5 }
                }
            }
        ]);
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
            let { organisme, readStatus } = await cursor.next();
            stats.total++;
            try {
                this.logger.info(`Sending email to ${organisme.courriel}`);

                await this.organismeNotificationEmail.send(organisme, readStatus);

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
