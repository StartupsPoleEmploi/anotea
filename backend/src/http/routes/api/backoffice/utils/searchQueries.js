const _ = require('lodash');
const moment = require('moment');
const { isPoleEmploi } = require('../../../../../common/utils/financeurs');
const isEmail = require('isemail').validate;

module.exports = db => {

    const getStagiaire = email => db.collection('trainee').findOne({ 'trainee.email': email });

    return {
        form: async (user, parameters) => {
            let { departement, codeFinanceur, siren, idFormation, startDate, scheduledEndDate, fulltext } = parameters;

            let fulltextIsEmail = isEmail(fulltext || '');
            let stagiaire = fulltextIsEmail ? await getStagiaire(fulltext) : null;
            //Profile parameters
            let organisme = siren ? new RegExp(`^${siren}`) : user.siret;
            let financeur = codeFinanceur || (isPoleEmploi(user.codeFinanceur) ? null : user.codeFinanceur);

            return {
                codeRegion: user.codeRegion,
                ...(user.profile !== 'financeur' ? { archived: false } : {}),
                ...(organisme ? { 'training.organisation.siret': organisme } : {}),
                ...(financeur ? { 'training.codeFinanceur': financeur } : {}),
                ...(departement ? { 'training.place.postalCode': new RegExp(`^${departement}`) } : {}),
                ...(idFormation ? { 'training.idFormation': idFormation } : {}),
                ...(startDate ? { 'training.startDate': { $gte: moment(startDate).toDate() } } : {}),
                ...(scheduledEndDate ? { 'training.scheduledEndDate': { $lte: moment(scheduledEndDate).toDate() } } : {}),
                ...(fulltextIsEmail ? { token: stagiaire ? stagiaire.token : 'unknown' } : {}),
                ...(fulltext && !fulltextIsEmail ? { $text: { $search: fulltext } } : {}),
            };
        },
        filters: parameters => {
            let { status, reponseStatus, reported, commentaires, qualification } = parameters;

            return {
                ...(_.isBoolean(reported) ? { reported } : {}),
                ...(_.isBoolean(commentaires) ? { comment: { $ne: null } } : {}),
                ...(qualification ? { qualification } : {}),

                ...(status === 'none' ? { moderated: { $ne: true }, comment: { $ne: null } } : {}),
                ...(status === 'published' ? { published: true } : {}),
                ...(status === 'rejected' ? { rejected: true } : {}),

                ...(reponseStatus ? { reponse: { $exists: true } } : {}),
                ...(['none', 'published', 'rejected'].includes(reponseStatus) ? { 'reponse.status': reponseStatus } : {}),
            };
        },
    };
};
