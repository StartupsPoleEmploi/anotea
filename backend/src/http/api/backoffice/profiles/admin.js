const Joi = require('joi');
const financeur = require('./financeur');

module.exports = (db, regions, user) => {

    let parent = financeur(db, regions, { ...user, codeFinanceur: '4' });

    return {
        type: 'admin',
        getUser: () => user,
        getShield: () => {
            return {};
        },
        validators: {
            form: () => {
                return {
                    ...parent.validators.form(),
                    codeRegion: Joi.string().valid(regions.findActiveRegions().map(f => f.codeRegion)),
                };
            },
            filters: () => {
                return {
                    ...parent.validators.filters(),
                };
            },
            pagination: () => {
                return {
                    ...parent.validators.pagination(),
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
                let { codeFinanceur, codeRegion } = parameters;
                return {
                    ...await parent.queries.buildStagiaireQuery(parameters),
                    'codeRegion': codeRegion || { $exists: true },
                    'formation.action.organisme_financeurs.code_financeur': codeFinanceur || { $exists: true },
                };
            },
            buildAvisQuery: async parameters => {
                let { codeFinanceur, codeRegion } = parameters;
                return {
                    ...await parent.queries.buildAvisQuery(parameters),
                    'codeRegion': codeRegion || { $exists: true },
                    'formation.action.organisme_financeurs.code_financeur': codeFinanceur || { $exists: true },
                };
            },
        },
    };
};
