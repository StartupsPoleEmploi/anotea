const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const asSiren = require('../../../../core/utils/asSiren');
const { arrayOf } = require('../../../utils/validators-utils');

module.exports = (db, regions, user) => {

    let region = regions.findRegionByCodeRegion(user.codeRegion);

    return {
        type: 'organisme',
        getUser: () => user,
        getShield: () => {
            Joi.string().required().validate(user.siret);
            return {
                'formation.action.organisme_formateur.siret': new RegExp(`^${asSiren(user.siret)}`)
            };
        },
        validators: {
            form: () => {
                return {
                    debut: Joi.number(),
                    fin: Joi.number(),
                    numeroFormation: Joi.string(),
                    departement: Joi.string().valid(...(region.departements.map(d => d.code))),
                    siren: Joi.string().regex(new RegExp(`^${user.siret.substring(0, 9)}`), 'siren'),
                    dispensateur: Joi.boolean(),
                    responsable: Joi.boolean(),
                };
            },
            filters: () => {
                return {
                    statuses: arrayOf(Joi.string().valid('validated', 'reported')),
                    reponseStatuses: arrayOf(Joi.string().valid('none', 'validated', 'rejected')),
                    read: Joi.bool(),
                    sortBy: Joi.string().allow('date', 'lastStatusUpdate', 'reponse.lastStatusUpdate'),
                };
            },
            pagination: () => {
                return {
                    page: Joi.number().min(0).default(0),
                };
            },
        },
        queries: {
            fieldsToExclude: () => {return {};},
            buildStagiaireQuery: async parameters => {
                let { departement, siren, numeroFormation, debut, fin, dispensateur = true, responsable = false } = parameters;

                let sirenSiret = user.siret;
                if (siren && user.siret.startsWith(siren)) {
                    sirenSiret = siren;
                }

                return {
                    ...(dispensateur ? {'formation.action.organisme_formateur.siret': new RegExp(`^${sirenSiret}[0-9]{0,5}$`)} : {}),
                    ...(responsable ? {'formation.action.organisme_responsable.siret': new RegExp(`^${sirenSiret}[0-9]{0,5}$`)} : {}),
                    ...(departement ? { 'formation.action.lieu_de_formation.code_postal': new RegExp(`^${departement}`) } : {}),
                    ...(numeroFormation ? { 'formation.numero': numeroFormation } : {}),
                    ...(debut ? { 'formation.action.session.periode.debut': { $gte: moment(debut).toDate() } } : {}),
                    ...(fin ? { 'formation.action.session.periode.fin': { $lte: moment(fin).toDate() } } : {}),
                };
            },
            buildAvisQuery: async parameters => {
                let {
                    departement, siren, numeroFormation, debut, fin,
                    reponseStatuses, read, statuses = ['validated', 'reported'],
                    dispensateur = true, responsable = false
                } = parameters;

                let sirenSiret = user.siret;
                if (siren && user.siret.startsWith(siren)) {
                    sirenSiret = siren;
                }

                return {
                    ...(dispensateur && responsable ? { $or: [
                        {'formation.action.organisme_formateur.siret': new RegExp(`^${sirenSiret}[0-9]{0,5}$`)},
                        {'formation.action.organisme_responsable.siret': new RegExp(`^${sirenSiret}[0-9]{0,5}$`)},
                    ]} : {}),
                    ...(!responsable ? {'formation.action.organisme_formateur.siret': new RegExp(`^${sirenSiret}[0-9]{0,5}$`)} : {}),
                    ...(!dispensateur && responsable ? {
                        'formation.action.organisme_responsable.siret': new RegExp(`^${sirenSiret}[0-9]{0,5}$`),
                        'formation.action.organisme_formateur.siret': { $not : new RegExp(`^${sirenSiret}[0-9]{0,5}$`)},
                    } : {}),
                    ...(departement ? { 'formation.action.lieu_de_formation.code_postal': new RegExp(`^${departement}`) } : {}),
                    ...(numeroFormation ? { 'formation.numero': numeroFormation } : {}),
                    ...(debut ? { 'formation.action.session.periode.debut': { $gte: moment(debut).toDate() } } : {}),
                    ...(fin ? { 'formation.action.session.periode.fin': { $lte: moment(fin).toDate() } } : {}),
                    ...(_.isBoolean(read) ? { read } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {}),
                    ...(reponseStatuses && reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
                };

            },
        },
    };
};
