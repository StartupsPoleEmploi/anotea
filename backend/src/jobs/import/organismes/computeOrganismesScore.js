const _ = require('lodash');

let round = value => Number(Math.round(value + 'e1') + 'e-1');

let getScore = accumulator => {

    if (accumulator.nb_avis === 0) {
        return _.pick(accumulator, ['nb_avis']);
    }

    let score = _.cloneDeep(accumulator);
    Object.keys(score.notes).forEach(key => {
        score.notes[key] = round(score.notes[key] / score.nb_avis);
    });

    return score;
};

const computeScore = async (db, organisme) => {
    let accumulator = {
        nb_avis: 0,
        notes: {
            accueil: 0,
            contenu_formation: 0,
            equipe_formateurs: 0,
            moyen_materiel: 0,
            accompagnement: 0,
            global: 0,
        },
        aggregation: {
            global: {
                max: Number.MIN_SAFE_INTEGER,
                min: Number.MAX_SAFE_INTEGER,
            },
        },
    };

    let cursor = await db.collection('comment').find({
        'training.organisation.siret': organisme.meta.siretAsString,
        '$or': [
            { 'comment': { $exists: false } },
            { 'comment': null },
            { 'published': true },
            { 'rejected': true },
        ]
    });

    while (await cursor.hasNext()) {
        let { rates } = await cursor.next();

        accumulator.nb_avis++;
        accumulator.notes.accueil += rates.accueil;
        accumulator.notes.contenu_formation += rates.contenu_formation;
        accumulator.notes.equipe_formateurs += rates.equipe_formateurs;
        accumulator.notes.moyen_materiel += rates.moyen_materiel;
        accumulator.notes.accompagnement += rates.accompagnement;
        accumulator.notes.global += rates.global;
        accumulator.aggregation.global.max = Math.max(rates.global, accumulator.aggregation.global.max);
        accumulator.aggregation.global.min = Math.min(rates.global, accumulator.aggregation.global.min);
    }

    return getScore(accumulator);
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
            let score = await computeScore(db, organisme);
            await db.collection('accounts').updateOne({ _id: organisme._id }, {
                $set: {
                    score,
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
