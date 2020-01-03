const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const ROUNDS = 10;

module.exports = configuration => {

    const getSHA256PasswordHashSync = password => {
        return crypto.createHmac('sha256', configuration.security.secret)
        .update(password)
        .digest('hex');
    };

    return {
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
        hashPassword: async password => {
            let salt = await bcrypt.genSalt(ROUNDS);
            return bcrypt.hash(password, salt);
        },
        checkPassword: async (password, hash) => {
            let legacyHash = getSHA256PasswordHashSync(password);
            return await bcrypt.compare(password, hash) || await bcrypt.compare(legacyHash, hash);
        }
    };
};
