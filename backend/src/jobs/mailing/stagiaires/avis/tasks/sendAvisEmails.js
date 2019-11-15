let titleize = require('underscore.string/titleize');
let { delay } = require('../../../../job-utils');


module.exports = async (db, logger, createEmail, action, options = {}) => {

    let stats = {
        total: 0,
        sent: 0,
        error: 0,
    };

    let cursor = db.collection('trainee').find(action.getQuery());
    if (options.limit) {
        cursor.limit(options.limit);
    }

    while (await cursor.hasNext()) {
        stats.total++;
        const trainee = await cursor.next();
        let email = trainee.trainee.email;
        trainee.trainee.firstName = titleize(trainee.trainee.firstName);
        trainee.trainee.name = titleize(trainee.trainee.name);

        try {
            logger.info(`Sending email to ${email} for campaign ${trainee.campaign}`);
            await createEmail(trainee).send(email);

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
