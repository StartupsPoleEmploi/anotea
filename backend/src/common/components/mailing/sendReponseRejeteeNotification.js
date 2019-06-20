const getOrganismeEmail = require('../../../common/utils/getOrganismeEmail');

module.exports = (db, mailer, logger) => {

    return commentId => {

        return new Promise(async (resolve, reject) => {

            let comment = await db.collection('comment').findOne({ _id: commentId });
            let organisme = await db.collection('accounts').findOne({
                SIRET: parseInt(comment.training.organisation.siret)
            });
            let email = getOrganismeEmail(organisme);

            mailer.sendReponseRejeteeNotification({ to: email }, organisme,
                async () => {
                    logger.info(`email sent to ${email} for rejected response`);
                    resolve();
                },
                async err => {
                    logger.error(`Unable to send email to ${email}`, err);
                    reject(new Error(err));
                });
        });
    };
};
