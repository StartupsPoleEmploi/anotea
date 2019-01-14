const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const ROUNDS = 10;

module.exports = {
    getAlgorithm: () => `$2a$${ROUNDS}$`,
    hashPassword: async password => {
        let salt = await bcrypt.genSalt(ROUNDS);
        return bcrypt.hash(password, salt);
    },
    verifyPassword: (password, hash) => {
        return bcrypt.compare(password, hash);
    },
    getSHA256PasswordHashSync: (password, configuration) => {
        return crypto.createHmac('sha256', configuration.security.secret)
        .update(password)
        .digest('hex');
    },
    isPasswordStrongEnough: password => {
        if (password === null || password === undefined || password === '') {
            return false;
        }
        // length greater or equal 6
        if (password.length >= 6) {
            // has uppercase
            if ((/[A-Z]/.test(password))) {
                // has special char
                if (/[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g.test(password)) {
                    return true;
                }
            }
        }
        return false;
    },
};
