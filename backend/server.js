const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongo = require('mongodb');
const RateLimit = require('express-rate-limit');
const Boom = require('boom');
const AuthService = require('./components/auth-service');

module.exports = (logger, configuration) => {

    const connectToMongoDB = callback => {
        return mongo.connect(configuration.mongodb.uri, { useNewUrlParser: true }, (err, client) => {
            if (err) {
                logger.error('Failed to connect to MongoDB - retrying in 5 sec', err.message);
                //TODO we should add a maxRetry
                return setTimeout(() => connectToMongoDB(callback), 5000);
            }
            callback(client);
        });
    };

    return new Promise(resolve => {

        connectToMongoDB(client => {
            logger.info('Successfully connected to MongoDB database');

            let db = client.db();
            let authService = new AuthService(logger, configuration);
            let app = express();

            app.use(cookieParser(configuration.security.secret));
            app.use(express.static(path.join(__dirname, '/public')));
            app.use(bodyParser.urlencoded({
                extended: true
            }));
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
            app.set('views', './views');

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

            let context = { db, authService, logger, configuration };

            //Public routes
            app.use('/api', require('./routes/swagger')(context));
            app.use('/api', require('./routes/api/v1/ping')(context));
            app.use('/api', require('./routes/api/v1/avis')(context));
            app.use('/api', require('./routes/api/v1/sessions')(context));
            app.use('/api', require('./routes/api/v1/actions')(context));
            app.use('/api', require('./routes/api/v1/organismes-formateurs')(context));
            app.use('/api', require('./routes/stats')(context));
            app.use('/api', require('./routes/backoffice/kairos')(context));

            //Pubic routes with server-side rendering (ie. questionary)
            app.use('/', require('./routes/front/front')(context));
            app.use('/', require('./routes/front/mailing')(context));

            //Routes used by backoffice applications
            app.use('/api', require('./routes/backoffice/login')(context));
            app.use('/api', require('./routes/backoffice/forgottenPassword')(context));
            app.use('/api', require('./routes/backoffice/comments')(context));
            app.use('/api', require('./routes/backoffice/organisations')(context));
            app.use('/api', require('./routes/backoffice/financer')(context));
            app.use('/api', require('./routes/backoffice/dashboard')(context));


            // catch 404
            app.use(function(req, res) {
                res.status(404);
                res.render('errors/404');
            });

            // eslint-disable-next-line no-unused-vars
            app.use((rawError, req, res, next) => {

                logger.error(rawError);

                let error = rawError;
                if (!rawError.isBoom) {
                    if (rawError.name === 'ValidationError') {
                        //This is a joi error
                        error = Boom.badRequest('Erreur de validation');
                        error.output.payload.details = rawError.details;
                    } else {
                        error = Boom.boomify(rawError, {
                            statusCode: 500,
                            message: 'Une erreur est survenue'
                        });
                    }
                }
                return res.status(error.output.statusCode).send(error.output.payload);
            });
            resolve(app);
        });
    });
};
