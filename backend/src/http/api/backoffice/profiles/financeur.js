const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const { isPoleEmploi, getFinanceurs } = require('../../../../core/utils/financeurs');
const { arrayOf } = require('../../../utils/validators-utils');

module.exports = (db, regions, user) => {

    let region = regions.findRegionByCodeRegion(user.codeRegion);

    return {
        type: 'financeur',
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
                    debut: Joi.number(),
                    fin: Joi.number(),
                    numeroFormation: Joi.string(),
                    departement: Joi.string().valid(region.departements.map(d => d.code)),
                    siren: Joi.string().min(9).max(9),
                    codeFinanceur: isPoleEmploi(user.codeFinanceur) ?
                        Joi.string().valid(getFinanceurs().map(f => f.code)) : Joi.any().forbidden(),
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
                let { departement, codeFinanceur, siren, numeroFormation, debut, fin } = parameters;
                let financeur = isPoleEmploi(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

                return {
                    'codeRegion': user.codeRegion,
                    'formation.action.organisme_financeurs.code_financeur': financeur,
                    ...(siren ? { 'formation.action.organisme_formateur.siret': new RegExp(`^${siren}`) } : {}),
                    ...(codeFinanceur ? { 'formation.action.organisme_financeurs.code_financeur': codeFinanceur } : {}),
                    ...(departement ? { 'formation.action.lieu_de_formation.code_postal': new RegExp(`^${departement}`) } : {}),
                    ...(numeroFormation ? { 'formation.numero': numeroFormation } : {}),
                    ...(debut ? { 'formation.action.session.periode.debut': { $gte: moment(debut).toDate() } } : {}),
                    ...(fin ? { 'formation.action.session.periode.fin': { $lte: moment(fin).toDate() } } : {}),
                };
            },
            buildAvisQuery: async parameters => {
                let {
                    departement, codeFinanceur, siren, numeroFormation, debut, fin,
                    commentaires, qualification, statuses = ['validated', 'rejected', 'reported', 'archived']
                } = parameters;

                let financeur = isPoleEmploi(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

                return {
                    'codeRegion': user.codeRegion,
                    'formation.action.organisme_financeurs.code_financeur': financeur,
                    ...(siren ? { 'formation.action.organisme_formateur.siret': new RegExp(`^${siren}`) } : {}),
                    ...(departement ? { 'formation.action.lieu_de_formation.code_postal': new RegExp(`^${departement}`) } : {}),
                    ...(numeroFormation ? { 'formation.numero': numeroFormation } : {}),
                    ...(debut ? { 'formation.action.session.periode.debut': { $gte: moment(debut).toDate() } } : {}),
                    ...(fin ? { 'formation.action.session.periode.fin': { $lte: moment(fin).toDate() } } : {}),
                    ...(qualification ? { qualification } : {}),
                    ...(_.isBoolean(commentaires) ? { commentaire: { $exists: commentaires } } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {}),
                };
            },
        },
    };
};
