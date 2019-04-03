class NotesDTO {

    constructor(data) {
        Object.assign(this, data);
    }

    toJSON() {
        return {
            accueil: Math.round(this.accueil),
            contenu_formation: Math.round(this.contenu_formation),
            equipe_formateurs: Math.round(this.equipe_formateurs),
            moyen_materiel: Math.round(this.moyen_materiel),
            accompagnement: Math.round(this.accompagnement),
            global: Math.round(this.global),
        };
    }
}

module.exports = NotesDTO;
