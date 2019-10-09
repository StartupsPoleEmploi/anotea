const Joi = require('joi');
const { isPoleEmploi, getCodeFinanceurs } = require('../../../../../common/utils/financeurs');
const { arrayOf } = require('../../../validators-utils');

module.exports = {
    form: (user, region) => {
        return {
            startDate: Joi.number(),
            scheduledEndDate: Joi.number(),
            idFormation: Joi.string(),
            departement: Joi.string().valid(region.departements.map(d => d.code)),
            fulltext: user.profile === 'moderateur' ? Joi.string() : Joi.any().forbidden(),
            codeFinanceur: isPoleEmploi(user.codeFinanceur) ? Joi.string().valid(getCodeFinanceurs()) : Joi.any().forbidden(),
            siren: user.profile === 'organisme' ?
                Joi.string().regex(new RegExp(`^${user.siret.substring(0, 9)}`), 'siren').default(user.siret) :
                Joi.string().min(9).max(9),
        };
    },
    filters: () => {
        return {
            status: Joi.string().valid(['none', 'published', 'rejected', 'reported']),
            reponseStatuses: arrayOf(Joi.string().valid(['none', 'published', 'rejected'])),
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
