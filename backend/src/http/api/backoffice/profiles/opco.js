const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const {getOpcos } = require('../../../../core/utils/opcos');
const { arrayOf } = require('../../../utils/validators-utils');

module.exports = (db, regions, user) => {

    return {
        type: 'opco',
        getUser: () => user,
        getShield: () => {
            return {
                dispositifFinancement:{'$in' : ['POEC_OPCA', 'OPCA']},
                codeOpco: user.codeOpco,
            };
        },
        validators: {
            form: () => {
                return {
                    codeRegion: Joi.string().valid(...(regions.findActiveRegions().map(f => f.codeRegion))),
                    debut: Joi.number(),
                    fin: Joi.number(),
                    numeroFormation: Joi.string(),
                    siren: Joi.string().min(0).max(9),
                    siret: Joi.string().min(0).max(14),
                    codeOpco: Joi.string().valid(...(getOpcos().map(f => f.code))),
                };
            },
            filters: () => {
                return {
                    statuses: arrayOf(Joi.string().valid('validated', 'rejected', 'reported', 'archived')),
                    reponseStatuses: arrayOf(Joi.string().valid('none', 'validated', 'rejected')),
                    qualification: Joi.string().valid('all', 'négatif', 'positif'),
                    commentaires: Joi.bool(),
                    sortBy: Joi.string().allow('date', 'lastStatusUpdate'),
                };
            },
            pagination: () => {
                return {
                    page: Joi.number().min(0).default(0),
                };
            },
        },
        queries: {
            fieldsToExclude: () => {
                return {
                    commentReport: 0,
                };
            },
            buildStagiaireQuery: async parameters => {
                throw new Error('buildStagiaireQuery ne doit pas être utilisé')
            },
            buildAvisQuery: async parameters => {
                let {
                    codeRegion, siren, siret, numeroFormation, debut, fin,
                    commentaires, qualification, statuses = ['validated', 'rejected', 'reported', 'archived']
                } = parameters;

                return {
                    dispositifFinancement:{'$in' : ['POEC_OPCA', 'OPCA']},
                    codeOpco: user.codeOpco,
                    ...(siret || siren ? { $or: [
                        {'formation.action.organisme_formateur.siret': new RegExp(`^${siret || siren}`)},
                        {'formation.action.organisme_responsable.siret': new RegExp(`^${siret || siren}`)},
                    ]} : {}),
                    codeRegion: codeRegion || { $exists: true },
                    ...(numeroFormation ? { 'formation.numero': numeroFormation } : {}),
                    ...(debut || fin ? { 'formation.action.session.periode.fin': {
                        ...(debut ? { $gte: moment(debut).toDate() } : {}),
                        ...(fin ? { $lte: moment(fin).toDate() } : {}),
                    }} : {}),
                    ...(qualification ? { qualification } : {}),
                    ...(_.isBoolean(commentaires) ? { commentaire: { $exists: commentaires } } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {})
                };
            },
        },
    };
};
