const Joi = require('joi');
const { isPoleEmploi, getCodeFinanceurs } = require('../../../../../common/utils/financeurs');

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

module.exports = regions => {
    return {
        objectId: () => Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'Identifiant invalide'),
        form: user => {

            let region = regions.findRegionByCodeRegion(user.codeRegion);
            return {
                startDate: Joi.number(),
                scheduledEndDate: Joi.number(),
                idFormation: Joi.string(),
                fulltext: Joi.string(),
                departement: Joi.string().valid(region.departements.map(d => d.code)),
                //Profile parameters
                siren: user.profile === 'organisme' ? Joi.any().forbidden() : Joi.string().min(9).max(9),
                codeFinanceur: isPoleEmploi(user.codeFinanceur) ?
                    Joi.string().valid(getCodeFinanceurs()) : Joi.any().forbidden(),
            };
        },
        filters: () => {
            return {
                status: Joi.string().valid(['none', 'published', 'rejected', 'reported']),
                reponseStatuses: arrayOf(Joi.string().valid(['none', 'published', 'rejected'])).default([]),
                read: Joi.bool(),
                qualification: Joi.string().valid(['all', 'négatif', 'positif']),
                commentaires: Joi.bool(),
                sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
            };
        },
        pagination: () => {
            return {
                page: Joi.number().min(0).default(0),
            };
        },
    };
};
