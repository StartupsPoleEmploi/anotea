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
            let { status, reponseStatuses, commentaires, qualification, read } = parameters;

            return {
                ...(_.isBoolean(read) ? { read } : {}),
                ...(_.isBoolean(commentaires) ? { comment: { $ne: null } } : {}),
                ...(qualification ? { qualification } : {}),

                ...(status === 'none' ? { moderated: false } : {}),
                ...(status === 'published' ? { published: true } : {}),
                ...(status === 'rejected' ? { rejected: true } : {}),
                ...(status === 'reported' ? { reported: true } : {}),

                ...(reponseStatuses.length > 0 ? { 'reponse.status': { $in: reponseStatuses } } : {}),
            };
        },
        profiled: user => {
            return {
                codeRegion: user.codeRegion,
                ...(user.profile === 'financeur' ? {} : { archived: false }),
                ...(user.profile === 'moderateur' ? {} : { moderated: true })
            };
        }
    };
};
