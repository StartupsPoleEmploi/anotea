const _ = require('lodash');
const roundNotes = require('./roundNotes');
const convertCommentToAvis = require('../../../../../common/utils/convertCommentToAvis');

let createReconciliationDTO = (data, options = {}) => {
    let dto = _.cloneDeep(data);

    dto.id = dto._id;
    delete dto._id;

    if (dto.meta) {
        delete dto.meta.import_date;
    }

    if (!options.notes_decimales && dto.avis) {
        dto.avis = dto.avis.map(a => Object.assign(a, { notes: roundNotes(a.notes) }));
    }

    if (!options.notes_decimales && dto.score && dto.score.notes) {
        dto.score.notes = roundNotes(dto.score.notes);
    }

    return _.pick(dto, ['id', 'numero', 'region', 'score', 'avis', 'meta']);
};
module.exports = {
    createFormationDTO: createReconciliationDTO,
    createActionDTO: createReconciliationDTO,
    createSessionDTO: createReconciliationDTO,
    createPaginationDTO: (pagination, total) => {
        return {
            ...pagination,
            total_items: total,
            total_pages: Math.ceil(total / pagination.items_par_page),
        };
    },
    createOrganismeFomateurDTO: (organisme, options = {}) => {
        let dto = {
            id: `${organisme._id}`,
            raison_sociale: organisme.raisonSociale,
            siret: organisme.meta ? organisme.meta.siretAsString : undefined,
            numero: organisme.numero, //TODO deprecated
            lieux_de_formation: organisme.lieux_de_formation,
            score: organisme.score,
        };

        if (!options.notes_decimales && dto.score && dto.score.notes) {
            dto.score.notes = roundNotes(dto.score.notes);
        }

        return dto;
    },
    createAvisDTO: (comment, options = {}) => {
        let dto = convertCommentToAvis(comment);

        if (!options.notes_decimales) {
            dto.notes = roundNotes(dto.notes);
        }

        return dto;
    },
};
