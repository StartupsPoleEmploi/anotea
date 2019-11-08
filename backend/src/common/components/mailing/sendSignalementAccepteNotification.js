const getOrganismeEmail = require('../../../common/utils/getOrganismeEmail');

module.exports = (db, mailer, logger) => {

    return async commentId => {

        let avis = await db.collection('comment').findOne({ _id: commentId });
        let organisme = await db.collection('accounts').findOne({
            SIRET: parseInt(avis.training.organisation.siret)
        });
        let email = getOrganismeEmail(organisme);

        return mailer.sendSignalementAccepteNotification(email, organisme, avis)
        .then(() => logger.info(`email sent to ${email} for validated avis`));
    };
};
