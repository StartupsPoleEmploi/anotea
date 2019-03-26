const Joi = require('joi');
module.exports = {
    objectId: () => Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide')
};
