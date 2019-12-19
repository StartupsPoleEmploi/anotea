const createMailer = require('../../../src/common/components/emails/mailer');

module.exports = (configuration, regions, options = {}) => {

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
        ...createMailer(configuration, regions),
        getEmailAddresses: () => calls.map(call => call.email),
        getEmailMessagesSent: () => calls,
        getLastEmailMessageSent: () => calls[calls.length - 1],
        flush: () => calls.splice(0, calls.length),
        createRegionalMailer: () => {
            return {
                sendEmail: (...args) => {
                    return registerCall(args);
                }
            };
        }
    };

};


