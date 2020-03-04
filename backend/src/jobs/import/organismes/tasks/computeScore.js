const computeScore = require('../../../../core/utils/computeScore');
const { batchCursor } = require('../../../job-utils');

module.exports = async (db, logger) => {

    let cursor = db.collection('accounts').find({ profile: 'organisme' });
    let stats = {
        total: 0,
        updated: 0,
        invalid: 0,
    };

    await batchCursor(cursor, async next => {
        const organisme = await next();
        stats.total++;
        try {
            let avis = await db.collection('avis').find({
                'formation.action.organisme_formateur.siret': organisme.siret,
                'status': { $in: ['validated', 'rejected'] },
            }).toArray();

            await db.collection('accounts').updateOne({ _id: organisme._id }, {
                $set: {
                    score: computeScore(avis),
                },
            });
            stats.updated++;

        } catch (e) {
            stats.invalid++;
            logger.error(`Can not compute score for organisme ${organisme.siret}`, e);
        }
    });

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
