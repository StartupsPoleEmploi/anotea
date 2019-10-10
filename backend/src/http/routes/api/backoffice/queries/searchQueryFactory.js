const Joi = require('joi');
const _ = require('lodash');
const moment = require('moment');
const { isPoleEmploi, getCodeFinanceurs } = require('../../../../../common/utils/financeurs');
const { arrayOf } = require('../../../validators');
const isEmail = require('isemail').validate;

module.exports = (db, regions, user) => {

    const getStagiaire = email => db.collection('trainee').findOne({ 'trainee.email': email });
    let region = regions.findRegionByCodeRegion(user.codeRegion);

    return {
        validators: {
            form: () => {
                return {
                    startDate: Joi.number(),
                    scheduledEndDate: Joi.number(),
                    idFormation: Joi.string(),
                    fulltext: Joi.string(),
                    departement: Joi.string().valid(region.departements.map(d => d.code)),
                    siren: user.profile === 'organisme' ? Joi.any().forbidden() : Joi.string().min(9).max(9),
                    codeFinanceur: isPoleEmploi(user.codeFinanceur) ? Joi.string().valid(getCodeFinanceurs()) : Joi.any().forbidden(),
                };
            },
            filters: () => {
                return {
                    status: Joi.string().valid(['none', 'published', 'rejected', 'reported']),
                    reponseStatuses: arrayOf(Joi.string().valid(['none', 'published', 'rejected'])),
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
        buildStagiaireQuery: async parameters => {
            let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate } = parameters;
            let financeur = isPoleEmploi(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

            return {
                codeRegion: user.codeRegion,
                ...(user.profile === 'financeur' ? { 'training.codeFinanceur': financeur } : {}),
                ...(user.profile === 'organisme' ? { 'training.organisation.siret': user.siret } : {}),
                ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
                ...(codeFinanceur ? { 'training.codeFinanceur': codeFinanceur } : {}),
                ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
            };
        },
        buildAvisQuery: async parameters => {
            let {
                status, reponseStatuses, commentaires, qualification, read,
                departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate, fulltext
            } = parameters;

            let fulltextIsEmail = isEmail(fulltext || '');
            let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;
            let financeur = isPoleEmploi(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

            return {
                codeRegion: user.codeRegion,
                ...(user.profile !== 'moderateur' ? { moderated: true } : {}),
                ...(user.profile !== 'financeur' ? { archived: false } : {}),
                ...(user.profile === 'financeur' ? { 'training.codeFinanceur': financeur } : {}),
                ...(user.profile === 'organisme' ? { 'training.organisation.siret': user.siret } : {}),
                ...(siren ? { 'training.organisation.siret': new RegExp(`^${siren}`) } : {}),
                ...(codeFinanceur ? { 'training.codeFinanceur': codeFinanceur } : {}),
                ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),

                ...(fulltextIsEmail ? { token: stagiaire ? stagiaire.token : 'unknown' } : {}),
                ...(fulltext && !fulltextIsEmail ? { $text: { $search: fulltext } } : {}),

                ...(_.isBoolean(read) ? { read } : {}),
                ...(_.isBoolean(commentaires) ? { comment: { $ne: null } } : {}),
                ...(qualification ? { qualification } : {}),

                ...(status === 'none' ? { moderated: false } : {}),
                ...(status === 'published' ? { published: true } : {}),
                ...(status === 'rejected' ? { rejected: true } : {}),
                ...(status === 'reported' ? { reported: true } : {}),

                ...(reponseStatuses && reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
            };

        },
    };
};
