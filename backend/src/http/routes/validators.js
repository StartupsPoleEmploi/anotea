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
    arrayOf,
    arrayAsString,
    objectId: () => Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide'),
};
