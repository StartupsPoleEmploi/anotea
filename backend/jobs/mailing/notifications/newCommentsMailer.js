const moment = require('moment');
const getContactEmail = require('../../../components/getContactEmail');

module.exports = (db, logger, configuration, mailer) => {

    const findOrganismes = async () => {
        logger.info('Searching organismes with at least 5 non read comments...');
        return await db.collection('organismes')
        .find({
            'meta.nbAvis': { $gte: 5 },
            '$or': [
                { 'newCommentsNotificationEmailSentDate': { $lte: moment().subtract('15', 'days').toDate() } },
                { 'newCommentsNotificationEmailSentDate': null },
            ]
        })
        .limit(configuration.app.mailer.limit);
    };

    const getFirstUnreadComment = async organisme => {
        return await db.collection('comment').findOne({
            'training.organisation.siret': organisme.meta.siretAsString,
            'comment': { $ne: null },
            'read': { $ne: true },
            'published': true
        });
    };

    const markEmailAsSent = async organisme => {
        return await db.collection('organismes').updateOne({ _id: organisme._id }, {
            $set: {
                newCommentsNotificationEmailSentDate: new Date(),
            }
        });
    };

    const sendEmail = organisme => {
        return new Promise(async (resolve, reject) => {
            let data = {
                organisme,
                comment: await getFirstUnreadComment(organisme),
            };
            mailer.sendNewCommentsNotification({ to: getContactEmail(organisme) }, data, () => resolve(), err => reject(err));
        });
    };

    return {
        sendEmails: async () => {
            let total = 0;
            let cursor = await findOrganismes();

            while (await cursor.hasNext()) {
                let organisme = await cursor.next();
                try {
                    logger.info(`Sending email to ${organisme.courriel}`);
                    await sendEmail(organisme);
                    await markEmailAsSent(organisme);
                    total++;
                } catch (e) {
                    logger.error('Unable to send email: ', e);
                }
            }
            return {
                mailSent: total
            };
        },
    };
};
