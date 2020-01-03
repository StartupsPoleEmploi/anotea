const md5 = require('md5');

module.exports = configuration => {

    const passwords = require('../../../src/core/components/passwords')(configuration);
    return {
        isPasswordStrongEnough: passwords.isPasswordStrongEnough,
        hashPassword: async password => md5(password),
        checkPassword: (password, hash) => md5(password) === hash
    };
};
