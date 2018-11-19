const getContactEmail = require('../../../components/getContactEmail');

module.exports = (db, logger, configuration, mailer) => {

    let organismes = db.collection('organismes');

    const findOrganismes = async => {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - configuration.smtp.relaunchDelay);

        logger.debug('Searching organismes with at least one comment that didn\'t create an account...');
        return await organismes.find({  mailSentDate: {  $ne: null }, 
                                        mailSentDate: { $lte: lastWeek.toString() },
                                        passwordHash: null,
                                        resend: {  $ne: true }
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
        sendEmails: async region => {
            let total = 0;
            let cursor = await findOrganismes();
            while (await cursor.hasNext()) {
                let results = await cursor.next();
                try {
                    await sendEmail(results.organisme);
                    total++;
                } catch (e) {
                    await handleSendError(results.organisme, e);
                }
            }
            return {
                mailSent: total
            };
        }
    };
};
