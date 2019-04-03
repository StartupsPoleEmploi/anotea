const _ = require('lodash');

module.exports = organisme => {
    organisme.status = organisme.passwordHash ? 'active' : 'inactive';
    if (organisme.score && organisme.score.notes) {
        let notes = organisme.score.notes;
        organisme.score.notes = {
            accueil: Math.round(notes.accueil),
            contenu_formation: Math.round(notes.contenu_formation),
            equipe_formateurs: Math.round(notes.equipe_formateurs),
            moyen_materiel: Math.round(notes.moyen_materiel),
            accompagnement: Math.round(notes.accompagnement),
            global: Math.round(notes.global),
        };
    }
    return _.omit(organisme, ['passwordHash', 'token']);
};
