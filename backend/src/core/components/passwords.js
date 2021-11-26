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
            return ( (!(password === null || password === undefined || password === '')) // mot de passe non vide
                    && (password.length >= 8)   // longueur minimale de huit caractères
                    && (/[0-9]/.test(password)) // au moins un chiffre
                    && (/[a-z]/.test(password)) // au moins une lettre minuscule
                    && (/[A-Z]/.test(password)) // au moins une lettre majuscule
                    && (/[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g.test(password)) // au moins un caractère spécial
                    ); 
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
