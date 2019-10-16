const Joi = require('joi');
const { arrayOf } = require('../../../validators-utils');

module.exports = {
    arrayOf: arrayOf,
    pagination: () => {
        return {
            page: Joi.number().min(0).default(0),
            items_par_page: Joi.number().min(0).max(2000).default(50),
        };
    },
    notesDecimales: () => {
        return {
            notes_decimales: Joi.boolean().default(false),
        };
    },
    fields: () => {
        return {
            fields: arrayOf(Joi.string().required()).default([]),
        };
    },
    commentaires: () => {
        return {
            commentaires: Joi.boolean().default(null),
        };
    },
};
