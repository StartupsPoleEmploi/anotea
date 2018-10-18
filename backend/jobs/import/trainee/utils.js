const crypto = require('crypto');
const uuid = require('node-uuid');
const configuration = require('config');

module.exports = {
    buildToken: email => {
        return crypto.createHmac('sha256', configuration.security.secret)
        .update(email + uuid.v4())
        .digest('hex');
    },
    buildEmail: data => {
        try {
            let email = data.toLowerCase();
            return {
                email: email,
                mailDomain: email.split('@')[1],
            };
        } catch (e) {
            return {
                email: null,
                mailDomain: null,
            };
        }
    }
};
