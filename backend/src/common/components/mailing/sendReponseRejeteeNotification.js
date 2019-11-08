const getOrganismeEmail = require('../../../common/utils/getOrganismeEmail');

module.exports = (db, mailer, logger) => {

    return async commentId => {

        let comment = await db.collection('comment').findOne({ _id: commentId });
        let organisme = await db.collection('accounts').findOne({
            SIRET: parseInt(comment.training.organisation.siret)
        });
        let email = getOrganismeEmail(organisme);

        return mailer.sendReponseRejeteeNotification(email, organisme, comment)
        .then(() => logger.info(`email sent to ${email} for rejected response`));
    };
};
