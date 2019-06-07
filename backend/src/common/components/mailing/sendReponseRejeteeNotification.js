module.exports = (db, mailer, logger) => {

    return (email, organisme) => {
        return new Promise((resolve, reject) => {
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
