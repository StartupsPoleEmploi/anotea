module.exports = notes => {

    return {
        accueil: Math.round(notes.accueil),
        contenu_formation: Math.round(notes.contenu_formation),
        equipe_formateurs: Math.round(notes.equipe_formateurs),
        moyen_materiel: Math.round(notes.moyen_materiel),
        accompagnement: Math.round(notes.accompagnement),
        global: Math.round(notes.global),
    };
};
