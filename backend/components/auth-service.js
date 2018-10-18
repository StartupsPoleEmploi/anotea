const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const _ = require('lodash');
const Boom = require('boom');

class AuthService {

    constructor(logger, configuration) {
        this.logger = logger;
        this.configuration = configuration;
    }

    createHMACAuthMiddleware(type) {
        let scheme = 'ANOTEA-HMAC-SHA256 ';
        let apiSignatureExpirationInSeconds = this.configuration.auth[type].expiration_in_seconds;

        return (req, res, next) => {
            try {
                let credentials = req.headers.authorization.substring(scheme.length);
                let [apiKey, timestamp, digest] = credentials.split(':');

                if (new Date().getTime() - timestamp > apiSignatureExpirationInSeconds * 1000) {
                    throw Boom.unauthorized(`Le header Authorization est expiré (durée de vie ${apiSignatureExpirationInSeconds}s)`);
                }

                if (apiKey !== 'esd') {
                    throw Boom.unauthorized('Clé d\'api inconnue');
                }

                let serverSideDigest = this.buildHmacDigest(this.configuration.auth[type].secret, {
                    timestamp,
                    method: req.method,
                    path: req.originalUrl,
                    body: req.rawBody,
                });

                if (digest === serverSideDigest) {
                    req.user = apiKey;
                    return next();
                }

                throw Boom.unauthorized(`Le header Authorization contient une signature invalide`);

            } catch (e) {
                if (e.isBoom) {
                    throw e;
                }
                throw Boom.unauthorized(`Cette resource doit être appelée avec un header Authorization: ` +
                    `${scheme}<yourApiKey>:<timestamp>:<sha256-hmac-digest>`, e);
            }
        };
    }

    createJWTAuthMiddleware(type, options) {
        return (req, res, next) => {
            let scheme = 'Bearer ';
            if (!req.headers.authorization || !req.headers.authorization.startsWith(scheme)) {
                //FIXME we need to trap all error into an express middleware and log them
                this.logger.error(`No authorization header found for request ${req.method}/${req.url}`);
                res.status(401).send({ error: true });
                return;
            }

            const token = req.headers.authorization.substring(scheme.length);
            return this.checkJWT(type, token, options)
            .then(decoded => {
                req.user = decoded;
                next();
            })
            .catch(e => {
                if (options.onInvalidToken) {
                    return options.onInvalidToken(e);
                }

                this.logger.error(`Unable to read token from authorization header for request ${req.method}/${req.url} `, e);
                //TODO must thrown a Boom exception instead when all routes will have tryAndCatch wrapper
                res.status(401).send({ error: true });
            });
        };
    }

    buildHmacDigest(secret, data) {
        let hmac = crypto.createHmac('sha256', secret)
        .update(`${data.timestamp}${data.method}${data.path}`);

        if (!_.isEmpty(data.body)) {
            hmac.update(data.body);
        }

        return hmac.digest('hex');
    }

    checkJWT(type, token, options = {}) {
        return new Promise((resolve, reject) => {
            let secret = this.configuration.auth[type].secret;
            let jwtOptions = {
                algorithm: 'HS256',
                maxAge: this.configuration.auth[type].expiration_in_seconds,
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
    }

    buildJWT(source, data) {

        let secret = this.configuration.auth[source].secret;
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
}

module.exports = AuthService;
