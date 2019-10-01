const Joi = require('joi');
const { isPoleEmploi, getCodeFinanceurs } = require('../../../../../common/utils/financeurs');

module.exports = regions => {
    return {
        form: user => {

            let region = regions.findRegionByCodeRegion(user.codeRegion);
            return {
                idFormation: Joi.string(),
                startDate: Joi.number(),
                scheduledEndDate: Joi.number(),
                reported: Joi.bool(),
                status: Joi.string().valid(['none', 'published', 'rejected']),
                reponseStatus: Joi.string().valid(['none', 'published', 'rejected']),
                qualification: Joi.string().valid(['all', 'négatif', 'positif']),
                commentaires: Joi.bool(),
                fulltext: Joi.string(),
                departement: Joi.string().valid(region.departements.map(d => d.code)),
                //Profile parameters
                siren: user.profile === 'organisme' ? Joi.any().forbidden() : Joi.string().min(9).max(9),
                codeFinanceur: isPoleEmploi(user.codeFinanceur) ? Joi.string().valid(getCodeFinanceurs()) : Joi.any().forbidden(),
            };
        },
        filters: () => {
            return {
                status: Joi.string().valid(['none', 'published', 'rejected']),
                reponseStatus: Joi.string().valid(['none', 'published', 'rejected']),
                reported: Joi.bool(),
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
