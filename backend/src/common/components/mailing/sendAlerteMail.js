module.exports = (db, mailer, logger) => {

    return (email, trainee, comment, reason) => {
        return new Promise((resolve, reject) => {
            mailer.sendAlerteMail({ to: email }, trainee, comment,
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
