let { delay } = require('../../../../job-utils');
const getOrganismeEmail = require('../../../../../common/utils/getOrganismeEmail');

module.exports = async (db, logger, createEmail, action, options = {}) => {

    let stats = {
        total: 0,
        sent: 0,
        error: 0,
    };

    let cursor = await db.collection('accounts').find({
        ...action.getQuery(),
        ...(options.siret ? { 'meta.siretAsString': options.siret } : {})
    });
    if (options.limit) {
        cursor.limit(options.limit);
    }
    cursor.batchSize(10);

    while (await cursor.hasNext()) {
        let organisme = await cursor.next();
        logger.debug('Sending email to', organisme);

        stats.total++;
        try {
            let email = getOrganismeEmail(organisme);
            await createEmail(organisme).send(email);

            if (options.delay) {
                await delay(options.delay);
            }
            stats.sent++;
        } catch (err) {
            logger.error(err);
            stats.error++;
        }
    }
    return stats;
};
