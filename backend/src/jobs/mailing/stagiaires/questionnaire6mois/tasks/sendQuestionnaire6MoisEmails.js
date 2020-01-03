let { delay } = require("../../../../job-utils");


module.exports = async (db, logger, emails, options = {}) => {

    let stats = {
        total: 0,
        sent: 0,
        error: 0,
    };

    let cursor = db.collection("trainee").aggregate([
        {
            $match: {
                "mailing.questionnaire6Mois.mailSent": { $exists: false },
                "campaign": "STAGIAIRES_AES_TT_REGIONS_DELTA_2019-04-05",
                "training.certifInfos.0": { $exists: true },
                "unsubscribe": false,
            }
        },
        {
            $group: {
                _id: "$trainee.email",
                trainee: { $first: "$$ROOT" },
            }
        }
    ])
    .limit(options.limit || 1);

    while (await cursor.hasNext()) {
        stats.total++;
        let { trainee } = await cursor.next();

        try {
            logger.info(`Sending email to ${(trainee.trainee.email)}`);
            let message = emails.getEmailMessageByTemplateName("questionnaire6MoisEmail");

            await message.send(trainee);

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
