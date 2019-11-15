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
        sendMalformedImport: (...args) => registerCall(args),
    };
};
