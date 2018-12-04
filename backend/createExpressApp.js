const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
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
            //FIXME add extra tabs to prevent huge diffs. This must be fixed after the current PR is merged
            logger.info('Successfully connected to MongoDB database');

            let db = client.db();
            let badwords = require('./components/badwords')(logger, configuration);
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

            //Public routes
            app.use('/api', require('./routes/swagger')());
            app.use('/api', require('./routes/api/v1/ping')(authService));
            app.use('/api', require('./routes/api/v1/avis')(db, authService));
            app.use('/api', require('./routes/api/v1/sessions')(db, authService));
            app.use('/api', require('./routes/api/v1/actions')(db, authService));
            app.use('/api', require('./routes/api/v1/organismes-formateurs')(db, authService));
            app.use('/api', require('./routes/stats')(db, configuration));
            app.use('/api', require('./routes/backoffice/kairos')(db, authService, configuration));

            //Pubic routes with server-side rendering (ie. questionary)
            app.use('/', require('./routes/front/front')(db, logger, configuration, badwords));
            app.use('/', require('./routes/front/mailing')(db, logger, configuration));

            //Routes used by backoffice applications
            app.use('/api', require('./routes/backoffice/login')(db, authService, logger, configuration));
            app.use('/api', require('./routes/backoffice/forgottenPassword')(db, authService, logger, configuration));
            app.use('/api', require('./routes/backoffice/comments')(db, authService, logger, configuration));
            app.use('/api', require('./routes/backoffice/organisations')(db, authService, logger, configuration));
            app.use('/api', require('./routes/backoffice/financer')(db, authService, logger, configuration));
            app.use('/api', require('./routes/backoffice/dashboard')(db, authService, logger, configuration));
            app.use('/api', require('./routes/backoffice/sendMailToAvisHorsSujetOwner')(db, authService, logger, configuration));


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
