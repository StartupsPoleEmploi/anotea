const _ = require('lodash');
const moment = require('moment');
const { isPoleEmploi } = require('../../../../../common/utils/financeurs');
const isEmail = require('isemail').validate;

module.exports = db => {

    const getStagiaire = email => db.collection('trainee').findOne({ 'trainee.email': email });

    return {
        buildStagiaireQuery: async (user, parameters) => {
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
        buildAvisQuery: async (user, parameters) => {
            let {
                status, reponseStatuses, commentaires, qualification, read,
                departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate, fulltext
            } = parameters;

            let fulltextIsEmail = isEmail(fulltext || '');
            let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;
            let financeur = isPoleEmploi(user.codeFinanceur) ? (codeFinanceur || { $exists: true }) : user.codeFinanceur;

            return {
                ...(user.profile === 'moderateur' ? { codeRegion: user.codeRegion, archived: false } : {}),
                ...(user.profile === 'financeur' ? { codeRegion: user.codeRegion, moderated: true } : {}),
                ...(user.profile === 'organisme' ? { moderated: true, archived: false } : {}),
                ...(financeur ? { 'training.codeFinanceur': financeur } : {}),
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
