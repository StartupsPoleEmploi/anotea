const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const Boom = require('boom');
const createMiddlewares = require('./middlewares');

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

    app.use(middlewares.addRequestId());
    app.use(middlewares.logHttpRequests());
    app.use(middlewares.allowCORS());
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

    //Public routes
    app.use('/api/', middlewares.addRateLimit(sentry));
    app.use('/api', require('./routes/api/swagger')(httpComponents));
    app.use('/api', require('./routes/api/v1/ping')(httpComponents));
    app.use('/api', require('./routes/api/v1/avis')(httpComponents));
    app.use('/api', require('./routes/api/v1/formations')(httpComponents));
    app.use('/api', require('./routes/api/v1/actions')(httpComponents));
    app.use('/api', require('./routes/api/v1/sessions')(httpComponents));
    app.use('/api', require('./routes/api/v1/organismes-formateurs')(httpComponents));
    app.use('/api', require('./routes/api/stats')(httpComponents));
    app.use('/api', require('./routes/api/kairos')(httpComponents));

    //Pubic routes with server-side rendering
    app.use('/', require('./routes/front/front')(httpComponents));
    app.use('/', require('./routes/front/mailing')(httpComponents));

    //Routes used by backoffice applications
    app.use('/api', require('./routes/api/backoffice/auth/login')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/auth/forgottenPassword')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/moderateur/moderation')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/organismes/consultation')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/export')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/organismes/organisme')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/moderateur/gestion-organismes')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/financeur/financeur')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/stats')(httpComponents));
    app.use('/api', require('./routes/api/backoffice/auth/account')(httpComponents));
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
            sentry.sendError(rawError, { requestId: req.requestId });
        }
        return res.status(error.output.statusCode).send(error.output.payload);
    });

    return app;
};
