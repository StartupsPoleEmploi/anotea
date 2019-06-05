const _ = require('lodash');

let roundNotes = score => {
    let notes = _.cloneDeep(score.notes);
    Object.keys(score.notes).forEach(key => {
        notes[key] = Number(Math.round(score.notes[key] / score.nb_avis + 'e1') + 'e-1');
    });
    return notes;
};

const computeScore = async (db, siret) => {
    let score = {
        nb_avis: 0,
        notes: {
            accueil: 0,
            contenu_formation: 0,
            equipe_formateurs: 0,
            moyen_materiel: 0,
            accompagnement: 0,
            global: 0,
        }
    };

    let cursor = await db.collection('comment').find({
        'training.organisation.siret': siret,
        '$or': [
            { 'comment': { $exists: false } },
            { 'comment': null },
            { 'published': true },
            { 'rejected': true },
        ]
    });

    while (await cursor.hasNext()) {
        const comment = await cursor.next();
        score.nb_avis++;
        score.notes.accueil += comment.rates.accueil;
        score.notes.contenu_formation += comment.rates.contenu_formation;
        score.notes.equipe_formateurs += comment.rates.equipe_formateurs;
        score.notes.moyen_materiel += comment.rates.moyen_materiel;
        score.notes.accompagnement += comment.rates.accompagnement;
        score.notes.global += comment.rates.global;
    }
    if (score.nb_avis === 0) {
        return _.pick(score, ['nb_avis']);
    } else {
        score.notes = roundNotes(score);
        return score;
    }
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
