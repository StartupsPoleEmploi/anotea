module.exports = async (db, logger) => {

    let cursor = db.collection('accounts').find({ profile: 'organisme' });
    const computeScore = async siret => {
        let results = await db.collection('comment').aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $gte: ['$step', 2] },
                            { $eq: ['$training.organisation.siret', siret] },
                        ]
                    },
                    $or: [
                        { 'comment': { $exists: false } },
                        { 'comment': null },
                        { 'published': true },
                        { 'rejected': true },
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    accueil: { $avg: '$rates.accueil' },
                    contenu_formation: { $avg: '$rates.contenu_formation' },
                    equipe_formateurs: { $avg: '$rates.equipe_formateurs' },
                    moyen_materiel: { $avg: '$rates.moyen_materiel' },
                    accompagnement: { $avg: '$rates.accompagnement' },
                    global: { $avg: '$rates.global' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    nb_avis: '$count',
                    notes: {
                        accueil: { $ceil: '$accueil' },
                        contenu_formation: { $ceil: '$contenu_formation' },
                        equipe_formateurs: { $ceil: '$equipe_formateurs' },
                        moyen_materiel: { $ceil: '$moyen_materiel' },
                        accompagnement: { $ceil: '$accompagnement' },
                        global: { $ceil: '$global' }
                    },
                }
            }
        ]).toArray();
        return results.length === 0 ? { nb_avis: 0 } : results[0];
    };

    let stats = {
        total: 0,
        updated: 0,
        invalid: 0,
    };

    while (await cursor.hasNext()) {
        const organisme = await cursor.next();
        try {
            stats.total++;
            await db.collection('accounts')
            .updateOne({ _id: organisme._id }, {
                $set: {
                    score: await computeScore(organisme.meta.siretAsString),
                },

            });
            stats.updated++;

        } catch (e) {
            stats.invalid++;
            logger.error(`Can not compute score for organisme ${organisme.meta.siretAsString}`, e);
        }
    }

    return stats.invalid === 0 ? Promise.resolve(stats) : Promise.reject(stats);
};
