module.exports = (options = {}) => {

    let calls = options.calls || [];
    let registerCall = parameters => {

        if (options.fail) {
            let err = new Error('Unable to send email');
            return Promise.reject(err);
        } else {
            calls.push({
                email: parameters[0],
                parameters: parameters[1],
                options: parameters[2],
            });
            return Promise.resolve();
        }
    };

    return {
        getEmailAddresses: () => calls.map(call => call.email),
        getEmailMessagesSent: () => calls,
        getLastEmailMessageSent: () => calls[calls.length - 1],
        createRegionalMailer: () => {
            return {
                sendEmail: (...args) => {
                    return registerCall(args);
                }
            };
        }
    };

};


