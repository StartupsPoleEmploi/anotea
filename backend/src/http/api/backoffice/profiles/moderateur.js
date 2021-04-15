const _ = require('lodash');
const Joi = require('joi');
const { arrayOf } = require('../../../utils/validators-utils');
const isEmail = require('isemail').validate;

module.exports = (db, user) => {

    const getStagiaireTokens = async email => {
        let stagiaires = await db.collection('stagiaires').find({ 'individu.email': email }).toArray();
        return stagiaires.map(stag => stag.token);
    };

    return {
        type: 'moderateur',
        getUser: () => user,
        getShield: () => {
            return {
                codeRegion: user.codeRegion
            };
        },
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
                let fulltextIsCodePostal = !isNaN(fulltext || 'a');
                let stagiaireTokens = fulltextIsEmail ? await getStagiaireTokens(fulltext) : null;

                return {
                    codeRegion: user.codeRegion,
                    ...(fulltextIsEmail ? { token: stagiaireTokens.length > 0 ? { $in: stagiaireTokens } : 'unknown' } : {}),
                    ...(fulltext && !fulltextIsEmail && !fulltextIsCodePostal ? { $text: { $search: fulltext } } : {}),
                    ...(fulltext && fulltextIsCodePostal ? { 'formation.action.lieu_de_formation.code_postal': { $regex: '^' + fulltext } } : {}),
                    ...(_.isBoolean(commentaires) ? { commentaire: { $exists: commentaires } } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {}),
                    ...(reponseStatuses && reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
                };
            },
        },
    };
};
