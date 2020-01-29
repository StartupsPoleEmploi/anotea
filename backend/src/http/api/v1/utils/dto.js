const _ = require('lodash');

let roundNotes = notes => {
    return {
        accueil: Math.round(notes.accueil),
        contenu_formation: Math.round(notes.contenu_formation),
        equipe_formateurs: Math.round(notes.equipe_formateurs),
        moyen_materiel: Math.round(notes.moyen_materiel),
        accompagnement: Math.round(notes.accompagnement),
        global: Math.round(notes.global),
    };
};

let createAvisDTO = (data, options = {}) => {

    let dto = _.cloneDeep(_.pick(data, ['_id', 'notes', 'formation', 'date']));
    dto.id = dto._id;
    delete dto._id;
    delete dto.formation.action.organisme_formateur.label;
    delete dto.formation.action.session.id;

    if (!options.notes_decimales) {
        dto.notes = roundNotes(dto.notes);
    }

    if (data.commentaire && data.status === 'validated') {
        dto.commentaire = {
            ...(!_.isEmpty(data.commentaire.text) ? { texte: data.commentaire.text } : {}),
            ...(!_.isEmpty(data.commentaire.title) && !data.commentaire.titleMasked ? { titre: data.commentaire.title } : {}),
        };
    } else {
        delete dto.commentaire;
    }

    if (data.reponse && data.status === 'validated' && data.reponse.status === 'validated') {
        data.reponse = {
            texte: data.reponse.text,
        };
    } else {
        delete dto.reponse;
    }

    return dto;
};

module.exports = {
    createAvisDTO,
    createIntercarifDTO: (data, options = {}) => {
        let dto = _.cloneDeep(data);

        dto.id = dto._id;
        delete dto._id;

        if (dto.meta) {
            delete dto.meta.import_date;
        }

        if (!options.notes_decimales && dto.avis) {
            dto.avis = dto.avis.map(a => createAvisDTO(a, options));
        }

        if (!options.notes_decimales && dto.score && dto.score.notes) {
            dto.score.notes = roundNotes(dto.score.notes);
        }

        return _.pick(dto, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
    },
    createPaginationDTO: (pagination, total) => {
        return {
            ...pagination,
            total_items: total,
            total_pages: Math.ceil(total / pagination.items_par_page),
        };
    },
    createOrganismeFomateurDTO: (organisme, options = {}) => {
        let dto = {
            id: organisme._id,
            raison_sociale: organisme.raison_sociale,
            siret: organisme.siret,
            numero: organisme.numero, //TODO deprecated
            lieux_de_formation: organisme.lieux_de_formation,
            score: organisme.score,
        };

        if (!options.notes_decimales && dto.score && dto.score.notes) {
            dto.score.notes = roundNotes(dto.score.notes);
        }

        return dto;
    },
};
