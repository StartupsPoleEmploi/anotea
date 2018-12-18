const Joi = require('joi');

const arrayAsStringValidator = () => {
    return Joi.extend(joi => ({
        base: joi.array(),
        name: 'arrayAsString',
        coerce: (value, state, options) => {
            return ((value && value.split) ? value.split(',') : value);
        },
    })).arrayAsString();
};

module.exports = {
    arrayOfValidator: (...items) => {
        return arrayAsStringValidator().items(items).single();
    },
    paginationValidator: () => {
        return {
            page: Joi.number().min(0).default(0),
            items_par_page: Joi.number().min(0).max(2000).default(50),
        };
    },
};
