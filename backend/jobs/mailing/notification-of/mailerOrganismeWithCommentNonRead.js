const getContactEmail = require('../../../components/getContactEmail');

module.exports = (db, logger, configuration, mailer) => {

    let organismes = db.collection('organismes');
    const MINIMUM_COMMENT_COUNT = 5;

    const findOrganismes = async () => {
        logger.info('Searching organismes with at least 5 non read comments...');
        return await organismes.aggregate([
            {
                $match: {
                    passwordHash: { $ne: null },
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
                            $match: {
                                $expr: {
                                    $and: [
                                        { $ne: ['$read', true] },
                                        { $eq: ['$published', true] },
                                        { $eq: ['$training.organisation.siret', '$$siret'] },
                                    ]
                                },
                                'comment': {$ne: null}
                            }
                        },
                        {
                            $count: 'nbComments'
                        }
                    ],
                    as: 'results'
                }
            },
            {
                $unwind: {
                    path: '$results',
                    preserveNullAndEmptyArrays: true,
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
                        $gte: MINIMUM_COMMENT_COUNT
                    },
                }
            }
        ]).limit(configuration.app.env === 'dev' ? 1 : configuration.app.mailer.limit);

    };

    const sendEmail = organisme => {
        logger.debug('Sending email to', organisme);

        return new Promise((resolve, reject) => {
            mailer.sendVosAvisNonLusMail({ to: getContactEmail(organisme) }, organisme, async () => {
                logger.info('Sending email to', organisme.courriel);
                resolve();
            }, err => reject(err));
        });
    };

    const handleSendError = (organisme, error) => {
        logger.error('Unable to send email: ', error);
    };

    return {
        sendEmails: async () => {
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
        },
    };
};
