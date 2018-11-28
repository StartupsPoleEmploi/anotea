module.exports = {
    successMailer: (spy = []) => {
        return {
            sendVotreAvisMail: (options, trainee, success) => {
                success();
                spy.push(options);
            }
        };
    },
    errorMailer: (spy = []) => {
        return {
            sendVotreAvisMail: (options, trainee, success, error) => {
                let err = new Error('timeout');
                spy.push(err);
                return error(err);
            }
        };
    }
};
