module.exports = (options = {}) => {

    let calls = options.calls || [];
    let registerCall = parameters => {

        if (options.fail) {
            let err = new Error('Unable to send email');
            return Promise.reject(err);
        } else {
            calls.push({
                email: parameters[0],
                message: parameters[1],
                options: parameters[2],
            });
            return Promise.resolve();
        }
    };

    return {
        getCalls: () => calls,
        createRegionalMailer: () => {
            return {
                sendEmail: (...args) => {
                    return registerCall(args);
                }
            };
        }
    };

};


