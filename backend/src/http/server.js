const path = require('path');
const express = require('express');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const RateLimit = require('express-rate-limit');
const Boom = require('boom');
const middlewares = require('./middlewares');

module.exports = components => {

    let app = express();
    let { logger, configuration, sentry, auth } = components;
    let httpComponents = Object.assign({}, components, {
        middlewares: middlewares(auth, logger, configuration),
    });

    let logMiddleware = (req, res, next) => {
        res.on('finish', () => {
            let error = req.err;
            logger[error ? 'error' : 'info']({
                type: 'http',
                ...(error ? { error } : {}),
                request: {
                    fullUrl: req.protocol + '://' + req.get('host') + req.baseUrl + req.url,
                    relativeUrl: (req.baseUrl || '') + (req.url || ''),
                    path: (req.baseUrl || '') + (req.path || ''),
                    parameters: _.omit(req.query, ['access_token']),
                    method: req.method,
                    headers: req.headers,
                    body: _.omit(req.body, ['password'])
                },
                response: {
                    statusCode: res.statusCode,
                    statusCodeAsString: `${res.statusCode}`,
                    headers: res._headers,
                },
                ...(error ? { stack: error.stack } : {}),
            }, `Http Request ${error ? 'KO' : 'OK'}`);
        });

        next();
    };

    app.use(logMiddleware);
    app.use(cookieParser(configuration.security.secret));
    app.use(express.static(path.join(__dirname, '/public')));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({
        verify: (req, res, buf, encoding) => {
            if (buf && buf.length) {
                req.rawBody = buf.toString(encoding || 'utf8');
            }
        }
    }));

    // inject Google Analytics and Hotjar tracking id into views
    app.locals.analytics = configuration.analytics;

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Allowing CORS
    app.use(function(req, res, next) {
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
    });

    app.use('/api/', new RateLimit({
        keyGenerator: req => req.headers['x-forwarded-for'] || req.ip,
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 120, // 2 requests per seconds
        delayMs: 0, // disabled
        handler: function(req, res) {
            if (this.headers) {
                res.setHeader('Retry-After', Math.ceil(this.windowMs / 1000));
            }
            res.format({
                html: () => {
                    res.status(this.statusCode).end(this.message);
                },
                json: () => {
                    res.status(this.statusCode).json({ message: this.message });
                }
            });
        }
    }));

    //Public routes
    app.use('/api', require('./routes/swagger')(httpComponents));
    app.use('/api', require('./routes/api/v1/ping')(httpComponents));
    app.use('/api', require('./routes/api/v1/avis')(httpComponents));
    app.use('/api', require('./routes/api/v1/sessions')(httpComponents));
    app.use('/api', require('./routes/api/v1/actions')(httpComponents));
    app.use('/api', require('./routes/api/v1/organismes-formateurs')(httpComponents));
    app.use('/api', require('./routes/stats')(httpComponents));
    app.use('/api', require('./routes/backoffice/auth/kairos')(httpComponents));

    //Pubic routes with server-side rendering
    app.use('/', require('./routes/front/front')(httpComponents));
    app.use('/', require('./routes/front/mailing')(httpComponents));

    //Routes used by backoffice applications
    app.use('/api', require('./routes/backoffice/auth/login')(httpComponents));
    app.use('/api', require('./routes/backoffice/auth/forgottenPassword')(httpComponents));
    app.use('/api', require('./routes/backoffice/moderateur/moderation')(httpComponents));
    app.use('/api', require('./routes/backoffice/organismes/consultation')(httpComponents));
    app.use('/api', require('./routes/backoffice/export')(httpComponents));
    app.use('/api', require('./routes/backoffice/organismes/organisme')(httpComponents));
    app.use('/api', require('./routes/backoffice/moderateur/gestion-organismes')(httpComponents));
    app.use('/api', require('./routes/backoffice/financeur/financeur')(httpComponents));
    app.use('/api', require('./routes/backoffice/stats')(httpComponents));
    app.use('/api', require('./routes/backoffice/auth/account')(httpComponents));
    app.use('/api', require('./routes/front/questionnaire')(httpComponents));

    // catch 404
    app.use(function(req, res) {
        res.status(404);
        res.render('errors/404');
    });

    //Error middleware
    app.use((rawError, req, res, next) => { // eslint-disable-line no-unused-vars

        let error = req.err = rawError;
        if (!rawError.isBoom) {
            if (rawError.name === 'ValidationError') {
                //This is a joi validatin error
                error = Boom.badRequest('Erreur de validation');
                error.output.payload.details = rawError.details;
            } else {
                error = Boom.boomify(rawError, {
                    statusCode: rawError.status || 500,
                    message: rawError.message || 'Une erreur est survenue',
                });
            }
        }

        if (error.output.statusCode > 404) {
            sentry.sendError(rawError);
        }
        return res.status(error.output.statusCode).send(error.output.payload);
    });

    return app;
};
