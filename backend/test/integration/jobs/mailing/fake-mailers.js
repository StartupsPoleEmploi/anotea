module.exports = {
    successMailer: (spy = []) => {
        return {
            sendVotreAvisMail: async (options, trainee, success) => {
                spy.push(options);
                success();
            },
            sendOrganisationAccountLink: async (options, trainee, success) => {
                spy.push(options);
                success();
            },
        };
    },
    errorMailer: (spy = []) => {
        return {
            sendVotreAvisMail: (options, trainee, success, error) => {
                let err = new Error('timeout');
                spy.push(err);
                return error(err);
            },
            sendOrganisationAccountLink: (options, trainee, success, error) => {
                let err = new Error('timeout');
                spy.push(err);
                return error(err);
            }
        };
    }
};
