const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Boom = require('boom');
const createMiddlewares = require('./middlewares/middlewares');
const compression = require('compression');

module.exports = components => {

    let app = express();
    let { logger, configuration, sentry, auth } = components;
    let middlewares = createMiddlewares(auth, logger, configuration);
    let httpComponents = Object.assign({}, components, {
        middlewares: middlewares,
    });

    // inject Google Analytics and Hotjar tracking id into views
    app.locals.analytics = configuration.analytics;
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    app.use(middlewares.rewriteDeprecatedUrl());
    app.use(middlewares.addRequestId());
    app.use(middlewares.logHttpRequests());
    app.use(middlewares.allowCORS());
    app.use(compression());
    app.use(cookieParser(configuration.security.secret));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(path.dirname(require.main.filename), 'build/public')));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({
        verify: (req, res, buf, encoding) => {
            if (buf && buf.length) {
                req.rawBody = buf.toString(encoding || 'utf8');
            }
        }
    }));

    //Pubic routes with HTML server-side rendering
    app.use('/', require('./routes/front/html-routes')(httpComponents));

    //API routes
    app.use('/api', middlewares.addRateLimit(sentry));
    app.use('/api', require('./routes/api/swagger-routes')(httpComponents));
    app.use('/api', require('./routes/api/v1/ping-routes')(httpComponents));
    app.use('/api', require('./routes/api/v1/avis-routes')(httpComponents));
    app.use('/api', require('./routes/api/v1/formations-routes')(httpComponents));
    app.use('/api', require('./routes/api/v1/actions-routes')(httpComponents));
    app.use('/api', require('./routes/api/v1/sessions-routes')(httpComponents));
    app.use('/api', require('./routes/api/v1/organismes-formateurs-routes')(httpComponents));
    app.use('/api', require('./routes/api/exports-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/departements-routes')(httpComponents));
    app.use('/api', require('./routes/api/stats-routes')(httpComponents));
    app.use('/api', require('./routes/api/kairos/kairos-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/login-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/password-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/activation-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/me-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/avis-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/organismes-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/organisation/consultation-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/organisation/organisation-routes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/moderateur/gestion-organismes-routes')(httpComponents));
    app.use('/api', require('./routes/api/questionnaire/questionnaire-routes')(httpComponents));

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
            sentry.sendError(rawError, { requestId: req.requestId });
        }
        return res.status(error.output.statusCode).send(error.output.payload);
    });

    return app;
};
