const Joi = require('joi');
const { arrayOf } = require('../../../validators-utils');
const isEmail = require('isemail').validate;

module.exports = (db, user) => {

    const getStagiaire = email => db.collection('trainee').findOne({ 'trainee.email': email });

    return {
        validators: {
            form: () => {
                return {
                    fulltext: user.profile === 'moderateur' ? Joi.string() : Joi.any().forbidden(),
                };
            },
            filters: () => {
                return {
                    statuses: arrayOf(Joi.string().valid(['none', 'published', 'rejected', 'reported'])),
                    reponseStatuses: arrayOf(Joi.string().valid(['none', 'published', 'rejected'])),
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
                let { statuses, fulltext, reponseStatuses } = parameters;

                let fulltextIsEmail = isEmail(fulltext || '');
                let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;

                return {
                    codeRegion: user.codeRegion,
                    archived: false,
                    ...(fulltextIsEmail ? { token: stagiaire ? stagiaire.token : 'unknown' } : {}),
                    ...(fulltext && !fulltextIsEmail ? { $text: { $search: fulltext } } : {}),
                    ...(statuses ? { status: { $in: statuses } } : {}),
                    ...(reponseStatuses && reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
                };

            },
        }
    };
};
