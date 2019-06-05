const Joi = require('joi');

const arrayAsString = () => {
    return Joi.extend(joi => ({
        base: joi.array(),
        name: 'arrayAsString',
        coerce: (value, state, options) => {
            return ((value && value.split) ? value.split(',') : value);
        },
    })).arrayAsString();
};

const arrayOf = (...items) => {
    return arrayAsString().items(items).single();
};

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
