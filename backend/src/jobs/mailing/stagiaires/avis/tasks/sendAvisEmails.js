let titleize = require('underscore.string/titleize');
let { delay } = require('../../../../job-utils');


module.exports = async (db, logger, emails, action, options = {}) => {

    let stats = {
        total: 0,
        sent: 0,
        error: 0,
    };

    let cursor = db.collection('stagiaires').find(action.getQuery());
    if (options.limit) {
        cursor.limit(options.limit);
    }

    while (await cursor.hasNext()) {
        stats.total++;
        const stagiaire = await cursor.next();
        let email = stagiaire.personal.email;
        stagiaire.personal.firstName = titleize(stagiaire.personal.firstName);
        stagiaire.personal.name = titleize(stagiaire.personal.name);

        try {
            logger.info(`Sending email to ${email} for campaign ${stagiaire.campaign}`);
            let message = emails.getEmailMessageByTemplateName('avisStagiaireEmail');
            await message.send(stagiaire);

            if (options.delay) {
                await delay(options.delay);
            }

            stats.sent++;
        } catch (err) {
            stats.error++;
            logger.error(err);
        }
    }

    if (stats.error > 0) {
        throw stats;
    }

    return stats;
};
