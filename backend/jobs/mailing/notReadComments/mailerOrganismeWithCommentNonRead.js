const getContactEmail = require('../../../components/getContactEmail');

module.exports = (db, logger, configuration, mailer) => {

    let organismes = db.collection('organismes');

    const findOrganismes = async () => {

        logger.debug('Searching organismes with at 5 non read comments...');
        return await organismes.aggregate([
            {
                $match: {
                    passwordHash: null,
                    mailSentDate: null,
                    sources: { $ne: null },
                    creationDate: { $exists: true }
                }
            },
            {
                $lookup: {
                    from: 'comment',
                    let: {
                        siret: '$meta.siretAsString'
                    },
                    pipeline: [
                        {
                            $project: {
                                'training.organisation.siret': 1,
                            }
                        },
                        {
                            $match: {
                                $expr: { $eq: ['$training.organisation.siret', '$$siret'] },
                                'read': { $ne: true },
                                'published': { $eq: true },
                                'reported': { $ne: true }
                            }
                        },
                        {
                            $count: 'nbNonReadComments'
                        }
                    ],
                    as: 'results'
                }

            },
            {
                $unwind:
                    {
                        path: '$results',
                        preserveNullAndEmptyArrays: true
                    }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        _id: '$_id',
                        organisme: '$$ROOT',
                        nbComments: '$results.nbComments',
                    }
                }
            },
            {
                $match: {
                    nbComments: {
                        $gte: 5
                    },
                }
            }
        ]).limit(configuration.app.env === 'dev' ? 1 : configuration.app.mailer.limit);

    };

    const sendEmail = organisme => {
        logger.debug('Sending email to', organisme);

        return new Promise((resolve, reject) => {
            mailer.sendVosAvisNonLusMail({ to: getContactEmail(organisme) }, organisme, async () => {
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
        sendEmails: async () => {
            let total = 0;
            let cursor = await findOrganismes;
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
        },
    };
};
