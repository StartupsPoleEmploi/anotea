const computeScore = async (db, siret) => {
    let results = await db.collection('comment').aggregate([
        {
            $match: {
                $expr: {
                    $eq: ['$training.organisation.siret', siret]
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
                    accueil: '$accueil',
                    contenu_formation: '$contenu_formation',
                    equipe_formateurs: '$equipe_formateurs',
                    moyen_materiel: '$moyen_materiel',
                    accompagnement: '$accompagnement',
                    global: '$global',
                },
            }
        }
    ]).toArray();

    if (results.length === 0) {
        return { nb_avis: 0 };
    }

    let { nb_avis: nbAvis, notes } = results[0];
    return {
        nb_avis: nbAvis,
        notes: {
            //TODO wait for $round in Mongo 4.2
            accueil: Math.round(notes.accueil),
            contenu_formation: Math.round(notes.contenu_formation),
            equipe_formateurs: Math.round(notes.equipe_formateurs),
            moyen_materiel: Math.round(notes.moyen_materiel),
            accompagnement: Math.round(notes.accompagnement),
            global: Math.round(notes.global),
        },
    };
};

module.exports = async (db, logger) => {

    let cursor = db.collection('accounts').find({ profile: 'organisme' });
    let stats = {
        total: 0,
        updated: 0,
        invalid: 0,
    };

    while (await cursor.hasNext()) {
        const organisme = await cursor.next();
        try {
            stats.total++;
            await db.collection('accounts').updateOne({ _id: organisme._id }, {
                $set: {
                    score: await computeScore(db, organisme.meta.siretAsString),
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
