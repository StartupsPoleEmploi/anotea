const Joi = require('joi');

const arrayAsString = () => {
    return Joi.extend(joi => ({
        base: joi.array(),
        name: 'arrayAsString',
        // eslint-disable-next-line no-unused-vars
        coerce: (value, state, options) => {
            return ((value && value.split) ? value.split(',') : value);
        },
    })).arrayAsString();
};

module.exports = {
    arrayAsString,
    arrayOf: (...items) => arrayAsString().items(items).single(),
    objectId: () => Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide'),
};
