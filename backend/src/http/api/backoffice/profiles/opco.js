const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const { isOpco, getOpcos } = require('../../../../core/utils/opcos');
const { arrayOf } = require('../../../utils/validators-utils');

module.exports = (db, regions, user) => {

    return {
        type: 'opco',
        getUser: () => user,
        getShield: () => {
            return {
                'codeRegion': user.codeRegion,
                'formation.action.organisme_financeurs.code_financeur': user.codeFinanceur,
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
                    codeFinanceur: isOpco(user.codeFinanceur) ?
                        Joi.string() : Joi.any().forbidden(),
                    // pas sur du fonctionnement de ceci !
                    codeOpco: isOpco(user.codeFinanceur) ?
                        Joi.string().valid(...(getOpcos().map(f => f.code))) : Joi.any().forbidden(),
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
                let { codeFinanceur, siren, siret, numeroFormation, debut, fin } = parameters;
                let financeur = isOpco(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

                return {
                    'codeRegion': user.codeRegion,
                    'formation.action.organisme_financeurs.code_financeur': financeur,
                    ...(siret || siren ? { $or: [
                        {'formation.action.organisme_formateur.siret': new RegExp(`^${siret || siren}`)},
                        {'formation.action.organisme_responsable.siret': new RegExp(`^${siret || siren}`)},
                    ]} : {}),
                    ...(codeFinanceur ? { 'formation.action.organisme_financeurs.code_financeur': codeFinanceur } : {}),
                    ...(numeroFormation ? { 'formation.numero': numeroFormation } : {}),
                    ...(debut ? { 'formation.action.session.periode.debut': { $gte: moment(debut).toDate() } } : {}),
                    ...(fin ? { 'formation.action.session.periode.fin': { $lte: moment(fin).toDate() } } : {})
                };
            },
            buildAvisQuery: async parameters => {
                let {
                    codeFinanceur, siren, siret, numeroFormation, debut, fin,
                    commentaires, qualification, statuses = ['validated', 'rejected', 'reported', 'archived']
                } = parameters;

                let financeur = isOpco(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

                return {
                    'codeRegion': user.codeRegion,
                    'formation.action.organisme_financeurs.code_financeur': financeur,
                    ...(siret || siren ? { $or: [
                        {'formation.action.organisme_formateur.siret': new RegExp(`^^${siret || siren}`)},
                        {'formation.action.organisme_responsable.siret': new RegExp(`^${siret || siren}`)},
                    ]} : {}),
                    ...(numeroFormation ? { 'formation.numero': numeroFormation } : {}),
                    ...(debut ? { 'formation.action.session.periode.debut': { $gte: moment(debut).toDate() } } : {}),
                    ...(fin ? { 'formation.action.session.periode.fin': { $lte: moment(fin).toDate() } } : {}),
                    ...(qualification ? { qualification } : {}),
                    ...(_.isBoolean(commentaires) ? { commentaire: { $exists: commentaires } } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {})
                };
            },
        },
    };
};
