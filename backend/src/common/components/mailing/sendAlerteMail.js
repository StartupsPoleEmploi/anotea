module.exports = (db, mailer, logger) => {

    return (email, trainee, comment, qualification) => {
        return mailer.sendAlerteMail({ to: email }, trainee, comment)
        .then(() => logger.info(`email sent to ${email} pour`, qualification));
    };
};
