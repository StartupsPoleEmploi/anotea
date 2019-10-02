const Joi = require('joi');
const _ = require('lodash');
const moment = require('moment');
const { isPoleEmploi } = require('../../../../../common/utils/financeurs');
const { arrayOf } = require('../../../validators');
const isEmail = require('isemail').validate;

module.exports = (db, user) => {

    const getStagiaire = email => db.collection('trainee').findOne({ 'trainee.email': email });
    const profiler = query => {

        if (user.profile === 'financeur') {
            return _.merge({}, query, {
                codeRegion: user.codeRegion,
                moderated: true,
                ...(isPoleEmploi(user.codeFinanceur) ?
                    { 'training.codeFinanceur': query['training.codeFinanceur'] || { $exists: true } } :
                    { 'training.codeFinanceur': user.codeFinanceur }),

            });
        }

        if (user.profile === 'moderateur') {
            return _.merge({}, query, {
                'codeRegion': user.codeRegion,
                'archived': false,
            });
        }

        return _.merge({}, query, {
            'codeRegion': user.codeRegion,
            'training.organisation.siret': user.siret,
            'moderated': true,
            'archived': false,
        });
    };

    return {
        validators: {
            form: () => {

                return {
                    startDate: Joi.number(),
                    scheduledEndDate: Joi.number(),
                    idFormation: Joi.string(),
                    fulltext: Joi.string(),
                    departement: Joi.string(),
                    siren: Joi.string().min(9).max(9),
                    codeFinanceur: Joi.string(),

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
        },
        queries: {
            form: async parameters => {
                let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate, fulltext } = parameters;

                let fulltextIsEmail = isEmail(fulltext || '');
                let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;

                return profiler({
                    ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
                    ...(codeFinanceur ? { 'training.codeFinanceur': codeFinanceur } : {}),
                    ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                    ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                    ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                    ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
                    ...(fulltextIsEmail ? { token: stagiaire ? stagiaire.token : 'unknown' } : {}),
                    ...(fulltext && !fulltextIsEmail ? { $text: { $search: fulltext } } : {}),
                });
            },
            filters: parameters => {
                let { status, reponseStatuses, commentaires, qualification, read } = parameters;

                return profiler({
                    ...(_.isBoolean(read) ? { read } : {}),
                    ...(_.isBoolean(commentaires) ? { comment: { $ne: null } } : {}),
                    ...(qualification ? { qualification } : {}),

                    ...(status === 'none' ? { moderated: false } : {}),
                    ...(status === 'published' ? { published: true } : {}),
                    ...(status === 'rejected' ? { rejected: true } : {}),
                    ...(status === 'reported' ? { reported: true } : {}),

                    ...(reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
                });
            },
        },
    };
};
