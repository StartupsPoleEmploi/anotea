const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const { arrayOf } = require('../../../validators-utils');

module.exports = (db, regions, user) => {

    let region = regions.findRegionByCodeRegion(user.codeRegion);

    return {
        validators: {
            form: () => {
                return {
                    startDate: Joi.number(),
                    scheduledEndDate: Joi.number(),
                    idFormation: Joi.string(),
                    departement: Joi.string().valid(region.departements.map(d => d.code)),
                    siren: Joi.string().regex(new RegExp(`^${user.siret.substring(0, 9)}`), 'siren'),
                };
            },
            filters: () => {
                return {
                    statuses: arrayOf(Joi.string().valid(['published', 'reported'])),
                    reponseStatuses: arrayOf(Joi.string().valid(['none', 'published', 'rejected'])),
                    read: Joi.bool(),
                    sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']),
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
                let { departement, idFormation, startDate, scheduledEndDate, siren = user.siret } = parameters;

                return {
                    'training.organisation.siret': new RegExp(`^${siren}`),
                    ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                    ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                    ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                    ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
                };
            },
            buildAvisQuery: async parameters => {
                let {
                    departement, idFormation, startDate, scheduledEndDate, siren = user.siret,
                    reponseStatuses, read, statuses = ['published', 'reported']
                } = parameters;


                return {
                    'training.organisation.siret': new RegExp(`^${siren}`),
                    ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                    ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                    ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                    ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
                    ...(_.isBoolean(read) ? { read } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {}),
                    ...(reponseStatuses && reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
                };

            },
        }
    };
};
