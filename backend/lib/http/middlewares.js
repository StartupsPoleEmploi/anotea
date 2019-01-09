const Boom = require('boom');

module.exports = (auth, logger, configuration) => {
    return {
        createHMACAuthMiddleware: (types, options) => {
            let scheme = 'ANOTEA-HMAC-SHA256 ';

            return (req, res, next) => {
                try {
                    if (options.allowNonAuthenticatedRequests && !req.headers.authorization) {
                        return next();
                    }

                    let credentials = req.headers.authorization.substring(scheme.length);
                    let [apiKey, timestamp, digest] = credentials.split(':');

                    if (!types.includes(apiKey)) {
                        throw Boom.unauthorized('Clé d\'api inconnue');
                    }

                    let apiSignatureExpirationInSeconds = configuration.auth[apiKey].expiration_in_seconds;
                    if (new Date().getTime() - timestamp > apiSignatureExpirationInSeconds * 1000) {
                        throw Boom.unauthorized(`Le header Authorization est expiré (durée de vie ${apiSignatureExpirationInSeconds}s)`);
                    }

                    let serverSideDigest = auth.buildHmacDigest(configuration.auth[apiKey].secret, {
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
        },

        createJWTAuthMiddleware: (type, options = {}) => {
            return (req, res, next) => {
                let scheme = 'Bearer ';
                if ((!req.headers.authorization || !req.headers.authorization.startsWith(scheme)) && !req.query.token) {
                    //FIXME we need to trap all error into an express middleware and log them
                    logger.error(`No authorization header found for request ${req.method}/${req.url}`);
                    throw Boom.unauthorized('Utilisateur non authentifié');
                }

                const token = req.query.token || req.headers.authorization.substring(scheme.length);
                return auth.checkJWT(type, token, options)
                .then(decoded => {
                    req.user = decoded;
                    next();
                })
                .catch(e => {
                    if (options.onInvalidToken) {
                        return options.onInvalidToken(e);
                    }

                    logger.error(`Unable to read token from authorization header for request ${req.method}/${req.url} `, e);
                    throw Boom.unauthorized('Utilisateur non authentifié');
                });
            };
        },

        checkProfile: profile => {
            return (req, res, next) => {
                if (req.user.profile !== profile) {
                    console.log("oooooo", req.user.profile, profile)
                    //TODO must thrown a Boom exception instead when all routes will have tryAndCatch wrapper
                    res.status(401).send({ error: true });
                    return;
                }
                next();
            };
        }
    };
};

