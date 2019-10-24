module.exports = (db, mailer, logger) => {

    return (email, trainee, comment, qualification) => {
        return new Promise((resolve, reject) => {
            mailer.sendInjureMail({ to: email }, trainee, comment,
                async () => {
                    logger.info(`email sent to ${email} pour`, qualification);
                    resolve();
                },
                async err => {
                    logger.error(`Unable to send email to ${email}`, err);
                    reject(new Error(err));
                });
        });
    };
};
