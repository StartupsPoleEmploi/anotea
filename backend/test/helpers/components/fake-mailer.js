module.exports = (options = {}) => {

    let calls = [];
    let registerCall = parameters => {
        if (options.fail) {
            let err = new Error('Unable to send email');
            calls.push(err);
            return Promise.reject(err);
        } else {
            calls.push(parameters);
            return Promise.resolve();
        }
    };

    return {
        getCalls: () => calls,
        sendNewEmail: (...args) => registerCall(args),
        getLastEmailAddress: () => calls.length === 0 ? null : calls[calls.length - 1][0],
        getUnsubscribeLink: (...args) => registerCall(args),
        getFormLink: (...args) => registerCall(args),
        sendOrganisationAccountEmail: (...args) => registerCall(args),
        sendVotreAvisMail: (...args) => registerCall(args),
        sendMalformedImport: (...args) => registerCall(args),
        sendReponseRejeteeNotification: (...args) => registerCall(args),
        sendInjureMail: (...args) => registerCall(args),
        sendQuestionnaire6MoisMail: (...args) => registerCall(args),
    };
};
