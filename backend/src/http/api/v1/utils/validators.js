const Joi = require('joi');
const { arrayOf } = require('../../../utils/validators-utils');


const pagination = () => {
    return {
        page: Joi.number().min(0).default(0),
        items_par_page: Joi.number().min(0).max(2000).default(50),
    };
};
const notesDecimales = () => {
    return {
        notes_decimales: Joi.boolean().default(false),
    };
};
const fields = () => {
    return {
        fields: arrayOf(Joi.string().required()).default([]),
    };
};
const commentaires = () => {
    return {
        commentaires: Joi.boolean().default(null),
    };
};
const tri = () => {
    return {
        tri: Joi.string().valid('date', 'notes', 'formation').default('date'),
        ordre: Joi.string().valid('asc', 'desc').default('desc'),
    };
};

const organismeSearchSchema = Joi.object({
    ...pagination(),
    id: arrayOf(Joi.string()),
    numero: arrayOf(Joi.string()),
    siret: arrayOf(Joi.string()),
    lieu_de_formation: arrayOf(Joi.string()),
    nb_avis: Joi.number(),
    ...fields(),
    ...pagination(),
    ...notesDecimales(),
});
const catalogueSearchSchema = Joi.object({
    id: arrayOf(Joi.string()),
    numero: arrayOf(Joi.string()),
    region: arrayOf(Joi.string()),
    nb_avis: Joi.number(),
    ...fields(),
    ...pagination(),
    ...notesDecimales(),
});
const catalogueFindSchema = Joi.object({
    'id': Joi.string().required(),
    'x-anotea-widget': Joi.string().allow(),
    ...fields(),
    ...notesDecimales(),
});
const catalogueFindAvisSchema = Joi.object({
    id: Joi.string().required(),
    ...pagination(),
    ...commentaires(),
    ...notesDecimales(),
    ...tri(),
});

module.exports = {
    arrayOf,
    pagination,
    notesDecimales,
    fields,
    commentaires,
    tri,
    organismeSearchSchema,
    catalogueSearchSchema,
    catalogueFindSchema,
    catalogueFindAvisSchema,
};
