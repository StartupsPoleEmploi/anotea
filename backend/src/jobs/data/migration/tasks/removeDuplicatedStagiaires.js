const moment = require('moment');
const { batchCursor } = require('../../../job-utils');

module.exports = async (db, logger) => {
    let stats = {
        total: 0,
        preserved: 0,
        removed: 0,
        invalid: 0,
    };

    let cursor = db.collection('trainee').aggregate([
        { $sort: { 'training.scheduledEndDate': -1 } },
        {
            $group: {
                _id: {
                    email: '$trainee.email',
                    idSession: '$training.idSession',
                },
                sum: { $sum: 1 },
                avis: { $push: '$avisCreated' },
                tokens: { $push: '$token' },
                scheduledEndDates: { $push: '$training.scheduledEndDate' },
            }
        },
        {
            $match: {
                sum: { $gte: 2 }
            }
        }
    ], { allowDiskUse: true });

    await batchCursor(cursor, async next => {
        const res = await next();
        stats.total += res.tokens.length;
        try {
            let tokensToRemove = Object.values(res.tokens);
            if (res.avis.findIndex(v => v === true) > -1) {
                tokensToRemove = tokensToRemove.filter((token, i) => !res.avis[i]);
            } else {
                let found = res.scheduledEndDates.reduce((acc, date, index) => {
                    if (!acc || moment(date.value).isAfter(moment(acc.value))) {
                        return { value: date, index };
                    }
                    return acc;
                }, null);
                tokensToRemove.splice(found.index, 1);
            }

            await Promise.all(tokensToRemove.map(token => db.collection('trainee').removeOne({ token })));

            stats.removed += tokensToRemove.length;
            stats.preserved += res.tokens.length - tokensToRemove.length;
        } catch (e) {
            stats.invalid++;
            logger.error(`Can not remove duplicated stagiaires`, e);
        }
    });

    return stats;
};
