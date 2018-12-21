const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const _ = require('lodash');

module.exports = configuration => {

    return {
        buildHmacDigest: (secret, data) => {
            let hmac = crypto.createHmac('sha256', secret)
            .update(`${data.timestamp}${data.method}${data.path}`);

            if (!_.isEmpty(data.body)) {
                hmac.update(data.body);
            }

            return hmac.digest('hex');
        },

        checkJWT: (type, token, options = {}) => {
            return new Promise((resolve, reject) => {
                let secret = configuration.auth[type].secret;
                let jwtOptions = {
                    algorithm: 'HS256',
                    maxAge: configuration.auth[type].expiration_in_seconds,
                };

                if (options.externalToken) {
                    jwtOptions.subject = type;
                }

                JWT.verify(token, secret, jwtOptions, (err, decoded) => {

                    if (err) {
                        return reject(err);
                    }

                    let unix = moment.unix(decoded.iat);
                    if (!unix.isValid() || unix.isAfter(moment())) {
                        return reject(new Error('iat is invalid'));
                    }

                    return resolve(decoded);
                });
            });
        },

        buildJWT: (source, data) => {

            let secret = configuration.auth[source].secret;
            let jwtOptions = {
                algorithm: 'HS256',
                expiresIn: '1 days',
                subject: data.sub,
            };

            delete data.sub;

            return new Promise((resolve, reject) => {
                JWT.sign(data, secret, jwtOptions, (err, token) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve({
                        access_token: token,
                        token_type: 'bearer'
                    });
                });
            });
        }
    };
};
