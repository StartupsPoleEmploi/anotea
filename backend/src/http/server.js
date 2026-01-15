const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { badRequest, boomify } = require('@hapi/boom');
const compression = require('compression');
const createMiddlewares = require('./utils/middlewares/middlewares');

module.exports = (components, options = {}) => {

    let app = express();
    let { logger, configuration, auth } = components;
    let middlewares = createMiddlewares(auth, logger, configuration);
    let httpComponents = Object.assign({}, components, {
        middlewares: middlewares,
    });

    app.use(middlewares.rewriteDeprecatedUrl());
    app.use(middlewares.addRequestId());
    app.use(middlewares.logHttpRequests());
    app.use(middlewares.allowCORS());
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({
        verify: (req, res, buf, encoding) => {
            if (buf && buf.length) {
                req.rawBody = buf.toString(encoding || 'utf8');
            }
        },
        limit: '5kb',
    }));

    //Site
    app.use(require('./site/pages-routes')(httpComponents));
    app.use(require('./site/static-routes')(httpComponents));
    app.use(require('./site/emails-routes')(httpComponents));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'site', 'pages'));

    //Api
    app.use('/api', middlewares.addRateLimit());
    app.use(require('./api/v1/ping-routes')(httpComponents));
    app.use(require('./api/v1/avis-routes')(httpComponents));
    app.use(require('./api/v1/formations-routes')(httpComponents));
    app.use(require('./api/v1/actions-routes')(httpComponents));
    app.use(require('./api/v1/sessions-routes')(httpComponents));
    app.use(require('./api/v1/organismes-formateurs-routes')(httpComponents));
    app.use(require('./api/backoffice/regions-routes')(httpComponents));
    app.use(require('./api/kairos/kairos-routes')(httpComponents));
    app.use(require('./api/backoffice/login-routes')(httpComponents));
    app.use(require('./api/backoffice/password-routes')(httpComponents));
    app.use(require('./api/backoffice/activation-routes')(httpComponents));
    app.use(require('./api/backoffice/me-routes')(httpComponents));
    app.use(require('./api/backoffice/avis-routes')(httpComponents));
    app.use(require('./api/backoffice/stagiaires-routes')(httpComponents));
    app.use(require('./api/backoffice/formations-routes')(httpComponents));
    app.use(require('./api/backoffice/sirens-routes')(httpComponents));
    app.use(require('./api/backoffice/departements-routes')(httpComponents));
    app.use(require('./api/backoffice/financeurs-routes')(httpComponents));
    app.use(require('./api/backoffice/stats-routes')(httpComponents));
    app.use(require('./api/backoffice/gestion-organismes-routes')(httpComponents));
    app.use(require('./api/backoffice/emails-preview-routes')(httpComponents));
    app.use(require('./api/questionnaire/questionnaire-routes')(httpComponents));
    if (options.swagger) {
        app.use(require('./api/v1/swagger-routes')(httpComponents));
    }

    // catch 404
    app.use((req, res) => {
        res.status(404);
        res.render('errors/404');
    });

    //Error middleware
    app.use((rawError, req, res, next) => { // eslint-disable-line no-unused-vars
        let error = req.err = rawError;
        if (!rawError.isBoom) {
            if (rawError.name === 'ValidationError') {
                //This is a joi validatin error
                error = badRequest('Erreur de validation');
                error.output.payload.details = rawError.details;
            } else {
                error = boomify(rawError, {
                    statusCode: rawError.status || 500,
                    ...(!rawError.message ? 'Une erreur est survenue' : {}),
                });
            }
        }

        return res.status(error.output.statusCode).send(error.output.payload);
    });

    return app;
};
