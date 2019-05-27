module.exports = avis => {

    let average = (avis, field) => {
        let value = avis.map(a => a.notes[field]).reduce((acc, value) => {
            acc += value;
            return acc;
        }, 0);

        return Number(Math.round((value / avis.length) + 'e1') + 'e-1');
    };

    let score = {
        nb_avis: avis.length,
    };

    if (avis.length > 0) {
        score.notes = {
            accueil: average(avis, 'accueil'),
            contenu_formation: average(avis, 'contenu_formation'),
            equipe_formateurs: average(avis, 'equipe_formateurs'),
            moyen_materiel: average(avis, 'moyen_materiel'),
            accompagnement: average(avis, 'accompagnement'),
            global: average(avis, 'global'),
        };
    }
    return score;
};
