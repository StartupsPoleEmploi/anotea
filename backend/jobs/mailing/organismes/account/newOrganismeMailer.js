const getContactEmail = require('../../../../components/getContactEmail');

module.exports = (db, logger, configuration, mailer) => {

    let organismes = db.collection('organismes');

    const findOrganismesByRegion = async region => {

        logger.debug('Searching organismes with at least one comment...');
        return await db.collection('organismes')
        .find({
            'passwordHash': null,
            'mailSentDate': null,
            'sources': { $ne: null },
            'codeRegion': region,
            'meta.nbAvis': { $gte: 1 },
        })
        .limit(configuration.app.mailer.limit);
    };

    const sendEmail = organisme => {
        logger.debug('Sending email to', organisme);

        return new Promise((resolve, reject) => {
            mailer.sendOrganisationAccountLink({ to: getContactEmail(organisme) }, organisme, async () => {
                await organismes.update({ '_id': organisme._id }, {
                    $set: {
                        mailSentDate: new Date()
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
        sendEmailsByRegion: async region => {
            let total = 0;
            let cursor = await findOrganismesByRegion(region);
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
        },
        sendEmailBySiret: async siret => {
            let organisme = await organismes.findOne({ 'meta.siretAsString': siret });
            try {
                await sendEmail(organisme);
            } catch (e) {
                await handleSendError(organisme, e);
            }
            return {
                mailSent: 1
            };
        }
    };
};
