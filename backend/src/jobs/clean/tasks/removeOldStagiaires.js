const moment = require('moment');

module.exports = async (db, logger) => {
    logger.info(`Deleting old stagiaires...`);

    let stats = {
        deletedMailSentNoDate: 0,
        deletedMailSentTooOld: 0,
        deletedMailNotSent: 0,
    };

    stats.deletedMailSentNoDate = (await db.collection('stagiaires').updateMany(
        {
            mailSent: true,
            mailSentDate: { $exists: false },
            individu: { $exists: true }
        },
        { $unset: { individu: 1 } }
    )).result.nModified;

    stats.deletedMailSentTooOld = (await db.collection('stagiaires').updateMany(
        {
            mailSent: true,
            mailSentDate: { $lt: moment().subtract(1, 'years').toDate() },
            individu: { $exists: true },
        },
        { $unset: { individu: 1 } }
    )).result.nModified;

    stats.deletedMailNotSent = (await db.collection('stagiaires').updateMany(
        {
            mailSent: { $ne: true },
            individu: { $exists: true }
        },
        { $unset: { individu: 1 } }
    )).result.nModified;

    await db.collection('jobs').insertOne({
        type: 'delete-stagiaires',
        stats: stats,
        date: new Date(),
    });

    return stats;
};
