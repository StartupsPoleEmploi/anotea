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
                    siren: Joi.string().regex(new RegExp(`^${user.siret.substring(0, 9)}`), 'siren').default(user.siret),
                };
            },
            filters: () => {
                return {
                    status: Joi.string().valid(['none', 'published', 'rejected', 'reported']),
                    reponseStatuses: arrayOf(Joi.string().valid(['none', 'published', 'rejected'])),
                    read: Joi.bool(),
                    sortBy: Joi.string().allow(['date', 'lastStatusUpdate', 'reponse.lastStatusUpdate']).default('date'),
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
                let { departement, siren, idFormation, startDate, scheduledEndDate } = parameters;

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
                    status, reponseStatuses, read,
                    departement, siren, idFormation, startDate, scheduledEndDate
                } = parameters;

                return {
                    'moderated': true,
                    'archived': false,
                    'training.organisation.siret': new RegExp(`^${siren}`),
                    ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                    ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                    ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                    ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
                    ...(_.isBoolean(read) ? { read } : {}),

                    ...(status === 'none' ? { moderated: false } : {}),
                    ...(status === 'published' ? { published: true } : {}),
                    ...(status === 'rejected' ? { rejected: true } : {}),
                    ...(status === 'reported' ? { reported: true } : {}),

                    ...(reponseStatuses && reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
                };

            },
        }
    };
};
