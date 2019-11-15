let { delay } = require('../../../../job-utils');
let getOrganismeEmail = require('../../../../../common/utils/getOrganismeEmail');

module.exports = (db, logger, createEmail, options = {}) => {

    return new Promise(async (resolve, reject) => {

        let stats = {
            total: 0,
            sent: 0,
            error: 0,
        };

        let cursor = db.collection('accounts').find({
            'profile': 'organisme',
            'passwordHash': { $exists: true },
            'mailing.questionnaire.mailSent': { $exists: false },
        })
        .limit(options.limit || 1);

        while (await cursor.hasNext()) {
            stats.total++;
            let organisme = await cursor.next();
            let email = getOrganismeEmail(organisme);

            try {
                logger.info(`Sending email to ${email}`);

                await createEmail(organisme).send(getOrganismeEmail(organisme));

                if (options.delay) {
                    await delay(options.delay);
                }

                stats.sent++;
            } catch (err) {
                stats.error++;
                logger.error(err);
            }
        }

        return stats.error === 0 ? resolve(stats) : reject(stats);
    });
};
