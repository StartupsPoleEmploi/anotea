const computeScore = require('../../../../core/utils/computeScore');
const { batchCursor } = require('../../../job-utils');
const asSiren = require('../../../../core/utils/asSiren');

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
            const score = computeScore(avis);
            const nbAvisSirenFormateur = await db.collection('avis').countDocuments({
                'formation.action.organisme_formateur.siret': new RegExp(`^${asSiren(organisme.siret)}`),
                'status': { $in: ['validated', 'rejected'] },
            });
            const nbAvisResponsable = await db.collection('avis').countDocuments({
                'formation.action.organisme_responsable.siret': new RegExp(`^${asSiren(organisme.siret)}`),
                'status': { $in: ['validated', 'rejected'] },
            });
            const nbAvisResponsablePasFormateur = await db.collection('avis').countDocuments({
                'formation.action.organisme_responsable.siret': new RegExp(`^${asSiren(organisme.siret)}`),
                'formation.action.organisme_formateur.siret': { $not : new RegExp(`^${asSiren(organisme.siret)}`)},
                'status': { $in: ['validated', 'rejected'] },
            });

            await db.collection('accounts').updateOne({ _id: organisme._id }, {
                $set: {
                    score: score,
                    nbAvisResponsable: nbAvisResponsable,
                    nbAvisResponsablePasFormateur: nbAvisResponsablePasFormateur,
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
