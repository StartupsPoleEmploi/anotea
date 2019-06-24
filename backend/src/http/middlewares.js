const Boom = require('boom');
const _ = require('lodash');
const basicAuth = require('basic-auth');
const uuid = require('node-uuid');
const RateLimit = require('express-rate-limit');
const { tryAndCatch } = require('./routes/routes-utils');

module.exports = (auth, logger, configuration) => {
    return {
        createBasicAuthMiddleware: clientKeys => {

            let unauthorized = res => {
                res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
                return res.send(401);
            };

            return (req, res, next) => {

                let user = basicAuth(req);

                if (!user || !user.name || !user.pass) {
                    return unauthorized(res);
                }

                if (clientKeys.includes(user.name) && user.pass === configuration.auth[user.name].secret) {
                    return next();
                } else {
                    return unauthorized(res);
                }
            };
        },
        createHMACAuthMiddleware: (clientKeys, options) => {
            let scheme = 'ANOTEA-HMAC-SHA256 ';

            return tryAndCatch((req, res, next) => {
                try {
                    if (options.allowNonAuthenticatedRequests && !req.headers.authorization) {
                        return next();
                    }

                    let credentials = req.headers.authorization.substring(scheme.length);
                    let [apiKey, timestamp, digest] = credentials.split(':');

                    if (!clientKeys.includes(apiKey)) {
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
            });
        },
        createJWTAuthMiddleware: (clientKey, options = {}) => {
            return tryAndCatch((req, res, next) => {
                let scheme = 'Bearer ';
                if ((!req.headers.authorization || !req.headers.authorization.startsWith(scheme)) && !req.query.token) {
                    //FIXME we need to trap all error into an express middleware and log them
                    logger.error(`No authorization header found for request ${req.method}/${req.url}`);
                    //TODO must thrown a Boom exception instead when all routes will have tryAndCatch wrapper
                    res.status(401).send({ error: true });
                    return;
                }

                const token = req.query.token || req.headers.authorization.substring(scheme.length);
                return auth.checkJWT(clientKey, token, options)
                .then(decoded => {
                    req.user = decoded;
                    next();
                })
                .catch(e => {
                    if (options.onInvalidToken) {
                        return options.onInvalidToken(e);
                    }

                    logger.error(`Unable to read token from authorization header for request ${req.method}/${req.url} `, e);
                    //TODO must thrown a Boom exception instead when all routes will have tryAndCatch wrapper
                    res.status(401).send({ error: true });
                });
            });
        },
        checkProfile: (...profiles) => {
            return tryAndCatch((req, res, next) => {
                if (!profiles.includes(req.user.profile)) {
                    //TODO must thrown a Boom exception instead when all routes will have tryAndCatch wrapper
                    res.status(403).send({
                        'error': 'Forbidden',
                        'message': 'Action non autorisé',
                        'statusCode': 403
                    });
                    return;
                }
                next();
            });
        },
        logHttpRequests: () => (req, res, next) => {
            const accumulator = {};

            let jsonify = data => {
                if (!data) {
                    return null;
                }

                try {
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            };

            const shouldRecordChunks = req => {
                //Include only specific routes
                return new RegExp('^/api/kairos/.*').test(req.url) ||
                    new RegExp('^/api/backoffice/generate-auth-url.*').test(req.url);
            };

            const createChunkRecorder = res => {
                const chunks = [];

                return {
                    proxifyWrite: target => chunk => {
                        chunks.push(chunk);
                        target.apply(res, [chunk]);
                    },
                    proxifyEnd: (target, callback) => chunk => {
                        if (chunk) {
                            chunks.push(chunk);
                        }
                        callback(chunks);
                        target.apply(res, [chunk]);
                    }
                };
            };

            let log = () => {
                res.removeListener('finish', log);
                res.removeListener('close', log);

                let error = req.err;
                logger[error ? 'error' : 'info']({
                    type: 'http',
                    ...(!error ? {} : {
                        error: {
                            ...error,
                            stack: error.stack,
                        }
                    }),
                    request: {
                        requestId: req.requestId,
                        url: {
                            full: req.protocol + '://' + req.get('host') + req.baseUrl + req.url,
                            relative: (req.baseUrl || '') + (req.url || ''),
                            path: (req.baseUrl || '') + (req.path || ''),
                            parameters: _.omit(req.query, ['access_token']),
                        },
                        method: req.method,
                        headers: req.headers,
                        body: _.omit(req.body, ['password'])
                    },
                    response: {
                        statusCode: res.statusCode,
                        statusCodeAsString: `${res.statusCode}`,
                        headers: res._headers,
                        body: jsonify(accumulator.chunks),
                    },
                }, `Http Request ${error ? 'KO' : 'OK'}`);
            };

            res.on('close', log);
            res.on('finish', log);

            if (shouldRecordChunks(req)) {
                const recorder = createChunkRecorder(res);
                res.write = recorder.proxifyWrite(res.write);
                res.end = recorder.proxifyEnd(res.end, chunks => {
                    let allChunksAreBuffers = _.every(chunks, c => Buffer.isBuffer(c));
                    accumulator.chunks = allChunksAreBuffers ? Buffer.concat(chunks).toString('utf8') : chunks;
                });
            }

            next();

        },
        addRequestId: () => (req, res, next) => {
            req.requestId = uuid.v4();
            next();
        },
        allowCORS: () => (req, res, next) => {
            res.removeHeader('X-Powered-By');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
            res.setHeader('Access-Control-Allow-Credentials', true);
            // intercept OPTIONS method
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        },
        addRateLimit: sentry => new RateLimit({
            keyGenerator: req => req.headers['x-forwarded-for'] || req.ip,
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 120, // 2 requests per seconds
            delayMs: 0, // disabled
            handler: function(req, res) {
                if (this.headers) {
                    res.setHeader('Retry-After', Math.ceil(this.windowMs / 1000));
                }

                sentry.sendError(Boom.tooManyRequests(this.message), { requestId: req.requestId });

                res.format({
                    html: () => {
                        res.status(this.statusCode).end(this.message);
                    },
                    json: () => {
                        res.status(this.statusCode).json({ message: this.message });
                    }
                });
            }
        }),
        rewriteDeprecatedUrl: () => (req, res, next) => {
            let urlStartsWith = value => ((req.baseUrl || '') + (req.url || '')).lastIndexOf(value, 0) === 0;

            if (urlStartsWith('/img/')) {
                req.url = req.url.replace(new RegExp('^/img/'), '/static/images/');
            } else if (urlStartsWith('/css/')) {
                req.url = req.url.replace(new RegExp('^/css/'), '/static/css/');
            }
            next('route');
        },
    };
};

