const moment = require('moment');
const { batchCursor } = require('../../job-utils');

module.exports = async (db, logger) => {
    logger.info(`Deleting old stagiaires...`);

    let stats = {
        deletedMailSentNoDate: 0,
        deletedMailSentTooOld: 0,
        deletedMailNotSent: 0,
    };

    let cursorDeletedMailSentNoDate = db.collection('stagiaires').find(
        {
            mailSent: true,
            mailSentDate: { $exists: false },
            individu: { $exists: true }
        }
    );
    await batchCursor(cursorDeletedMailSentNoDate, async next => {
        const stagiaire = await next();
        const res = await db.collection('stagiaires').updateOne(
            { token: stagiaire.token },
            { $unset: { individu: 1 } }
        );
        if (res.result.nModified > 0) {
            stats.deletedMailSentNoDate++;
        }
    });

    let cursorDeletedMailSentTooOld = db.collection('stagiaires').find(
        {
            mailSent: true,
            mailSentDate: { $lt: moment().subtract(1, 'years').toDate() },
            individu: { $exists: true },
        }
    );
    await batchCursor(cursorDeletedMailSentTooOld, async next => {
        const stagiaire = await next();
        const res = await db.collection('stagiaires').updateOne(
            { token: stagiaire.token },
            { $unset: { individu: 1 } }
        );
        if (res.result.nModified > 0) {
            stats.deletedMailSentTooOld++;
        }
    });

    let cursorDeletedMailNotSent = db.collection('stagiaires').find(
        {
            mailSent: { $ne: true },
            individu: { $exists: true }
        }
    );
    await batchCursor(cursorDeletedMailNotSent, async next => {
        const stagiaire = await next();
        const res = await db.collection('stagiaires').updateOne(
            { token: stagiaire.token },
            { $unset: { individu: 1 } }
        );
        if (res.result.nModified > 0) {
            stats.deletedMailNotSent++;
        }
    });

    await db.collection('jobs').insertOne({
        type: 'delete-stagiaires',
        stats: stats,
        date: new Date(),
    });

    return stats;
};
