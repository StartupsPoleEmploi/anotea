module.exports = (data, options = {}) => {

    const round = value => options.notes_decimales ? value : Math.round(value);

    return {
        accueil: round(data.accueil),
        contenu_formation: round(data.contenu_formation),
        equipe_formateurs: round(data.equipe_formateurs),
        moyen_materiel: round(data.moyen_materiel),
        accompagnement: round(data.accompagnement),
        global: round(data.global),
    };
};
