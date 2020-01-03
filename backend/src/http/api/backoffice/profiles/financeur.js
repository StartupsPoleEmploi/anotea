const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const { isPoleEmploi, getCodeFinanceurs } = require('../../../../common/utils/financeurs');
const { arrayOf } = require('../../../utils/validators-utils');

module.exports = (db, regions, user) => {

    let region = regions.findRegionByCodeRegion(user.codeRegion);

    return {
        type: 'financeur',
        getUser: () => user,
        getShield: () => ({}),
        validators: {
            form: () => {
                return {
                    startDate: Joi.number(),
                    scheduledEndDate: Joi.number(),
                    idFormation: Joi.string(),
                    departement: Joi.string().valid(region.departements.map(d => d.code)),
                    siren: Joi.string().min(9).max(9),
                    codeFinanceur: isPoleEmploi(user.codeFinanceur) ?
                        Joi.string().valid(getCodeFinanceurs()) : Joi.any().forbidden(),
                };
            },
            filters: () => {
                return {
                    statuses: arrayOf(Joi.string().valid(['validated', 'rejected', 'reported', 'archived'])),
                    reponseStatuses: arrayOf(Joi.string().valid(['none', 'validated', 'rejected'])),
                    qualification: Joi.string().valid(['all', 'négatif', 'positif']),
                    commentaires: Joi.bool(),
                    sortBy: Joi.string().allow(['date', 'lastStatusUpdate']),
                };
            },
            pagination: () => {
                return {
                    page: Joi.number().min(0).default(0),
                };
            },
        },
        queries: {
            buildStagiaireQuery: async parameters => {
                let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate } = parameters;
                let financeur = isPoleEmploi(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

                return {
                    'codeRegion': user.codeRegion,
                    'training.codeFinanceur': financeur,
                    ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
                    ...(codeFinanceur ? { 'training.codeFinanceur': codeFinanceur } : {}),
                    ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                    ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                    ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                    ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
                };
            },
            buildAvisQuery: async parameters => {
                let {
                    departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate,
                    commentaires, qualification, statuses = ['validated', 'rejected', 'reported', 'archived']
                } = parameters;

                let financeur = isPoleEmploi(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

                return {
                    'codeRegion': user.codeRegion,
                    'training.codeFinanceur': financeur,
                    ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
                    ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                    ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                    ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                    ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
                    ...(qualification ? { qualification } : {}),
                    ...(_.isBoolean(commentaires) ? { comment: { $exists: commentaires } } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {}),
                };
            },
        },
    };
};
