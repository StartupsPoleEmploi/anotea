const _ = require('lodash');
const Joi = require('joi');
const { arrayOf } = require('../../../validators-utils');
const isEmail = require('isemail').validate;

module.exports = (db, user) => {

    const getStagiaire = email => db.collection('trainee').findOne({ 'trainee.email': email });

    return {
        type: 'moderateur',
        getUser: () => user,
        getShield: () => ({ codeRegion: user.codeRegion }),
        validators: {
            form: () => {
                return {
                    fulltext: user.profile === 'moderateur' ? Joi.string() : Joi.any().forbidden(),
                };
            },
            filters: () => {
                return {
                    commentaires: Joi.bool(),
                    statuses: arrayOf(Joi.string().valid(['none', 'validated', 'rejected', 'reported'])),
                    reponseStatuses: arrayOf(Joi.string().valid(['none', 'validated', 'rejected'])),
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
            buildStagiaireQuery: () => {
                return {
                    codeRegion: user.codeRegion,
                };
            },
            buildAvisQuery: async parameters => {
                let {
                    fulltext, reponseStatuses, commentaires,
                    statuses = ['none', 'validated', 'reported', 'rejected']
                } = parameters;

                let fulltextIsEmail = isEmail(fulltext || '');
                let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;

                return {
                    codeRegion: user.codeRegion,
                    ...(fulltextIsEmail ? { token: stagiaire ? stagiaire.token : 'unknown' } : {}),
                    ...(fulltext && !fulltextIsEmail ? { $text: { $search: fulltext } } : {}),
                    ...(_.isBoolean(commentaires) ? { comment: { $exists: commentaires } } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {}),
                    ...(reponseStatuses && reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
                };

            },
        },
    };
};
