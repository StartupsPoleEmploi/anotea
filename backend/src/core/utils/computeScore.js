const { round } = require("./number-utils");

module.exports = avis => {

    if (avis.length === 0) {
        return { nb_avis: 0 };
    }

    let score = avis.reduce((acc, avis) => {
        let { rates } = avis;
        acc.nb_avis++;
        acc.notes.accueil += rates.accueil;
        acc.notes.contenu_formation += rates.contenu_formation;
        acc.notes.equipe_formateurs += rates.equipe_formateurs;
        acc.notes.moyen_materiel += rates.moyen_materiel;
        acc.notes.accompagnement += rates.accompagnement;
        acc.notes.global += rates.global;
        acc.aggregation.global.max = Math.max(rates.global, acc.aggregation.global.max);
        acc.aggregation.global.min = Math.min(rates.global, acc.aggregation.global.min);
        return acc;
    }, {
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
    });

    Object.keys(score.notes).forEach(key => {
        score.notes[key] = round(score.notes[key] / score.nb_avis);
    });

    return score;
};
