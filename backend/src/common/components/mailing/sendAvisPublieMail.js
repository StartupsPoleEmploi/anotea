module.exports = (db, mailer, logger) => {

    return (email, trainee, avis, reason) => {
        return new Promise((resolve, reject) => {
            mailer.sendAvisPublieMail({ to: email }, trainee, avis,
                async () => {
                    logger.info(`email sent to ${email} pour`, reason);
                    resolve();
                },
                async err => {
                    logger.error(`Unable to send email to ${email}`, err);
                    reject(new Error(err));
                });
        });
    };
};
