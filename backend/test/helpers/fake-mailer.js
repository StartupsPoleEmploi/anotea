module.exports = () => {

    let calls = [];
    let registerCall = parameters => {
        calls.push(parameters);
        parameters.find(p => typeof p === 'function').apply();
    };

    return {
        getCalls: () => calls,
        getConsultationLink: (...args) => registerCall(args),
        getUnsubscribeLink: (...args) => registerCall(args),
        getFormLink: (...args) => registerCall(args),
        getOrganisationPasswordForgottenLink: (...args) => registerCall(args),
        sendNewCommentsNotification: (...args) => registerCall(args),
        sendOrganisationAccountLink: (...args) => registerCall(args),
        sendPasswordForgotten: (...args) => registerCall(args),
        sendVotreAvisMail: (...args) => registerCall(args),
        sendMalformedImport: (...args) => registerCall(args),
        sendAvisHorsSujetMail: (...args) => registerCall(args),
    };
};
