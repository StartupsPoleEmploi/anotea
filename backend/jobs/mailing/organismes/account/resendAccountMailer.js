const moment = require('moment');
const getContactEmail = require('../../../../components/getContactEmail');

module.exports = (db, logger, configuration, mailer) => {

    let organismes = db.collection('organismes');

    const findOrganismes = async () => {
        logger.debug('Searching organismes with at least one comment that didn\'t create an account yet...');
        let delay = configuration.smtp.organisme.newAccountRelaunchDelay;

        return await db.collection('organismes')
        .find({
            'meta.nbAvis': { $gte: 1 },
            '$and': [
                { mailSentDate: { $ne: null } },
                { mailSentDate: { $lte: moment().subtract(delay, 'days').toDate() } },
            ],
            'passwordHash': null,
            'resend': { $ne: true }
        })
        .sort({ mailSentDate: -1 })
        .limit(configuration.app.mailer.limit);
    };

    const sendEmail = organisme => {
        logger.debug('Resending email to', organisme);

        return new Promise((resolve, reject) => {
            mailer.sendOrganisationAccountLink({ to: getContactEmail(organisme) }, organisme, async () => {
                await organismes.update({ '_id': organisme._id }, {
                    $set: {
                        mailSentDate: new Date(),
                        resent: true
                    },
                    $unset: {
                        mailError: '',
                        mailErrorDetail: ''
                    },
                });
                resolve();
            }, err => reject(err));
        });
    };

    const handleSendError = (organisme, error) => {
        logger.error('Unable to send email: ', error);
        return organismes.update({ '_id': organisme._id }, {
            $set: {
                mailError: 'smtpError',
                mailErrorDetail: error
            }
        });
    };

    return {
        resendEmails: async () => {
            let total = 0;
            let cursor = await findOrganismes();
            while (await cursor.hasNext()) {
                let organisme = await cursor.next();
                try {
                    await sendEmail(organisme);
                    total++;
                } catch (e) {
                    await handleSendError(organisme, e);
                }
            }
            return {
                mailSent: total
            };
        }
    };
};
