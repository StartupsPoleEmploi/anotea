let { delay } = require("../../../../job-utils");
let getOrganismeEmail = require("../../../../../core/utils/getOrganismeEmail");

module.exports = async (db, logger, emails, action, options = {}) => {

    let stats = {
        total: 0,
        sent: 0,
        error: 0,
    };

    let cursor = await db.collection("accounts").find({
        ...action.getQuery(),
        ...(options.siret ? { "meta.siretAsString": options.siret } : {})
    });
    if (options.limit) {
        cursor.limit(options.limit);
    }
    cursor.batchSize(10);

    while (await cursor.hasNext()) {
        let organisme = await cursor.next();
        logger.info(`Sending email to ${organisme.raisonSociale}/${organisme.meta.siretAsString}/${getOrganismeEmail(organisme)}`);

        stats.total++;
        try {
            let message = emails.getEmailMessageByTemplateName("activationCompteEmail");
            await message.send(organisme);

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
