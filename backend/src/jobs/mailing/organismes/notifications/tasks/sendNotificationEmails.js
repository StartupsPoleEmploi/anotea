const moment = require('moment');
let { delay } = require('../../../../job-utils');
const getOrganismeEmail = require('../../../../../common/utils/getOrganismeEmail');

module.exports = async (db, logger, configuration, emails, options = {}) => {

    let findOrganismes = () => {
        logger.info('Searching organismes with at least 5 non read comments...');
        let delay = configuration.smtp.organisme.notificationsRelaunchDelay;

        return db.collection('accounts')
        .aggregate([
            {
                $match: {
                    'profile': 'organisme',
                    'passwordHash': { $ne: null },
                    ...(options.codeRegions ? { 'codeRegion': { $in: options.codeRegions } } : {}),
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
                                comment: { $first: '$$ROOT' },
                                nbUnreadComments: { $sum: 1 }
                            }
                        },
                    ],
                    as: 'notificationStatus'
                }
            },
            {
                $unwind: {
                    path: '$notificationStatus',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $match: {
                    'notificationStatus.nbUnreadComments': { $gte: 5 }
                }
            }
        ]);
    };

    let stats = {
        total: 0,
        sent: 0,
        error: 0,
    };

    let cursor = await findOrganismes();
    if (options.limit) {
        cursor.limit(options.limit);
    }
    cursor.batchSize(10);

    while (await cursor.hasNext()) {
        let { organisme, notificationStatus } = await cursor.next();
        stats.total++;
        try {
            let email = getOrganismeEmail(organisme);

            logger.info(`Sending email to ${email}`);
            let message = emails.getEmailMessageByTemplateName('avisNotificationEmail');
            await message.send(organisme, notificationStatus.comment, notificationStatus.nbUnreadComments);

            if (options.delay) {
                await delay(options.delay);
            }

            stats.sent++;
        } catch (e) {
            logger.error('Unable to send email: ', e);
            stats.error++;
        }
    }
    return stats;
}
;
