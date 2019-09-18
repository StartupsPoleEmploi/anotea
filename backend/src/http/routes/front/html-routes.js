const express = require('express');
const moment = require('moment');
const titleize = require('underscore.string/titleize');
const externalLinks = require('./utils/externalLinks');

module.exports = ({ db, logger, configuration, deprecatedStats, mailer, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getRegionEmail = region => {
        return region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from;
    };

    const getReplyToEmail = region => {
        return `Anotea <${getRegionEmail(region)}>`;
    };

    const getTraineeFromToken = (req, res, next) => {
        db.collection('trainee').findOne({ token: req.params.token })
        .then(trainee => {
            if (!trainee) {
                res.status(404).send({ error: 'not found' });
                return;
            }

            req.trainee = trainee;
            next();
        });
    };

    router.get('/', (req, res) => {
        res.render('front/homepage', { data: configuration.front });
    });

    router.get('/cgu', (req, res) => {
        res.render('front/cgu');
    });

    router.get('/faq', (req, res) => {
        res.render('front/faq');
    });

    router.get('/doc/:name', (req, res) => {
        let template = req.params.name;

        if (template === 'widget') {
            if (configuration.env === 'dev' && !req.query['load_anotea_widget_iframe_from_localhost']) {
                return res.redirect('/doc/widget?load_anotea_widget_iframe_from_localhost=true');
            }
            return res.render('front/doc/widget');
        }

        return res.render(`front/doc/${template}`);

    });

    router.get('/link/:token', getTraineeFromToken, async (req, res) => {
        let trainee = req.trainee;
        const goto = req.query.goto;

        const links = ['lbb', 'pe', 'clara'];

        if (!links.includes(goto)) {
            res.status(404).render('errors/404');
            return;
        }

        const advice = await db.collection('comment').findOne({ token: req.params.token });
        if (!(advice.tracking && advice.tracking.clickLink && advice.tracking.clickLink.filter(item => item.goto === goto).length > 0)) {
            db.collection('comment').updateOne({ token: req.params.token }, {
                $push: {
                    'tracking.clickLink': {
                        date: new Date(),
                        goto: goto
                    }
                }
            });
        }

        res.redirect(await externalLinks(db).getLink(trainee, goto));
    });

    router.get('/mail/:token', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const unsubscribeLink = mailer.getUnsubscribeLink(trainee);
        const formLink = mailer.getFormLink(trainee);
        trainee.trainee.firstName = titleize(trainee.trainee.firstName);
        trainee.trainee.name = titleize(trainee.trainee.name);

        res.render('../../smtp/views/votre_avis.ejs', {
            trainee: trainee,
            consultationLink: `${configuration.app.public_hostname}/mail/${trainee.token}?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`,
            unsubscribeLink: unsubscribeLink,
            trackingLink: `${configuration.app.public_hostname}/mail/${trainee.token}/track`,
            formLink: formLink,
            moment: moment,
            region: regions.findRegionByCodeRegion(trainee.codeRegion),
            hostname: configuration.app.public_hostname,
            webView: true
        });
    });

    router.get('/mail/:token/publie', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const unsubscribeLink = mailer.getUnsubscribeLink(trainee);

        res.render('../../smtp/views/avis_publie.ejs', {
            trainee: trainee,
            consultationLink: `${configuration.app.public_hostname}/mail/${trainee.token}/publie?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`,
            unsubscribeLink: unsubscribeLink,
            trackingLink: `${configuration.app.public_hostname}/mail/${trainee.token}/track`,
            hostname: configuration.app.public_hostname,
            webView: true
        });
    });

    router.get('/mail/:token/6mois', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const unsubscribeLink = mailer.getUnsubscribeLink(trainee);
        trainee.trainee.firstName = titleize(trainee.trainee.firstName);
        trainee.trainee.name = titleize(trainee.trainee.name);

        res.render('../../smtp/views/questionnaire_6mois.ejs', {
            trainee: trainee,
            consultationLink: `${configuration.app.public_hostname}/mail/${trainee.token}/6mois?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`,
            unsubscribeLink: unsubscribeLink,
            trackingLink: `${configuration.app.public_hostname}/mail/${trainee.token}/track`,
            formLink: 'https://avril_la_vae_facile.typeform.com/to/gIFh4q',
            moment: moment,
            region: regions.findRegionByCodeRegion(trainee.codeRegion),
            hostname: configuration.app.public_hostname,
            webView: true
        });
    });

    router.get('/mail/:tokenOrganisme/password', async (req, res) => {
        const organisme = await db.collection('accounts').findOne({ token: req.params.tokenOrganisme });
        if (organisme === null) {
            res.status(404).render('errors/404');
            return;
        }

        const region = regions.findRegionByCodeRegion(organisme.codeRegion);

        res.render('../../smtp/views/organisation_password.ejs', {
            trackingLink: `${configuration.app.public_hostname}/mail/${req.params.tokenOrganisme}/track`,
            link: `${configuration.app.public_hostname}/admin?action=passwordLost&token=${req.params.tokenOrganisme}`,
            consultationLink: `${configuration.app.public_hostname}/mail/${req.params.tokenOrganisme}/password`,
            contact: getRegionEmail(region),
            hostname: configuration.app.public_hostname,
            organisation: organisme,
            webView: true
        });
    });

    router.get('/mail/:tokenOrganisme/nonLus', async (req, res) => {
        const organisme = await db.collection('accounts').findOne({ token: req.params.tokenOrganisme });
        if (organisme === null) {
            res.status(404).render('errors/404');
            return;
        }

        const avis = await db.collection('comment').find({
            'comment': { $ne: null },
            'read': false,
            'published': true,
            'training.organisation.siret': organisme.SIRET
        });

        const region = regions.findRegionByCodeRegion(organisme.codeRegion);

        res.render('../../smtp/views/organisme_avis_non_lus.ejs', {
            trackingLink: `${configuration.app.public_hostname}/mail/${req.params.tokenOrganisme}/track`,
            link: `${configuration.app.public_hostname}/admin?action=passwordLost&token=${req.params.tokenOrganisme}`,
            consultationLink: `${configuration.app.public_hostname}/mail/${req.params.tokenOrganisme}/nonLus`,
            contact: getRegionEmail(region),
            hostname: configuration.app.public_hostname,
            comment: avis[0],
            organisme,
            webView: true
        });
    });

    router.get('/mail/:tokenOrganisme/reponseRejetee/:tokenAvis', async (req, res) => {
        const organisme = await db.collection('accounts').findOne({ token: req.params.tokenOrganisme });
        const avis = await db.collection('comment').findOne({ token: req.params.tokenAvis });
        if (organisme === null || avis === null) {
            res.status(404).render('errors/404');
            return;
        }

        const region = regions.findRegionByCodeRegion(organisme.codeRegion);

        res.render('../../smtp/views/organisme_reponse_rejetee.ejs', {
            trackingLink: `${configuration.app.public_hostname}/mail/${req.params.tokenOrganisme}/track`,
            link: `${configuration.app.public_hostname}/admin?action=passwordLost&token=${req.params.tokenOrganisme}`,
            consultationLink: `${configuration.app.public_hostname}/mail/${organisme.token}/reponseRejetee/${avis.token}`,
            contact: getRegionEmail(region),
            hostname: configuration.app.public_hostname,
            organisme,
            reponse: avis.reponse.text,
            webView: true
        });
    });

    router.get('/mail/:tokenOrganisme/signalementRejete/:tokenAvis', async (req, res) => {
        const organisme = await db.collection('accounts').findOne({ token: req.params.tokenOrganisme });
        const avis = await db.collection('comment').findOne({ token: req.params.tokenAvis });
        if (organisme === null || avis === null) {
            res.status(404).render('errors/404');
            return;
        }

        res.render('../../smtp/views/organisme_avis_signale_rejete.ejs', {
            trackingLink: `${configuration.app.public_hostname}/mail/${req.params.tokenOrganisme}/track`,
            consultationLink: `${configuration.app.public_hostname}/mail/${organisme.token}/signalementRejete/${avis.token}`,
            hostname: configuration.app.public_hostname,
            avis: avis.comment.text,
            webView: true
        });
    });

    router.get('/mail/:tokenOrganisme/signalementAccepte/:tokenAvis', async (req, res) => {
        const organisme = await db.collection('accounts').findOne({ token: req.params.tokenOrganisme });
        const avis = await db.collection('comment').findOne({ token: req.params.tokenAvis });
        if (organisme === null || avis === null) {
            res.status(404).render('errors/404');
            return;
        }

        res.render('../../smtp/views/organisme_avis_signale_publie.ejs', {
            trackingLink: `${configuration.app.public_hostname}/mail/${req.params.tokenOrganisme}/track`,
            consultationLink: `${configuration.app.public_hostname}/mail/${organisme.token}/signalementAccepte/${avis.token}`,
            hostname: configuration.app.public_hostname,
            avis: avis.comment.text,
            webView: true
        });
    });

    router.get('/mail/:token/passwordForgotten', async (req, res) => {
        const forgottenPasswordToken = await db.collection('forgottenPasswordTokens').findOne({ token: req.params.token });
        if (forgottenPasswordToken === null) {
            res.status(404).render('errors/404');
            return;
        }

        const account = await db.collection('accounts').findOne({ _id: forgottenPasswordToken.id });

        res.render('../../smtp/views/password_forgotten.ejs', {
            link: `${configuration.app.public_hostname}/admin?action=passwordLost&token=${req.params.token}`,
            consultationLink: `${configuration.app.public_hostname}/mail/${req.params.token}/passwordForgotten`,
            codeRegion: account.codeRegion,
            hostname: configuration.app.public_hostname,
            profile: forgottenPasswordToken.profile,
            webView: true
        });
    });

    router.get('/mail/:token/injure', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const comment = await db.collection('comment').findOne({ token: req.params.token });

        const unsubscribeLink = mailer.getUnsubscribeLink(trainee);
        const formLink = mailer.getFormLink(trainee);
        trainee.trainee.firstName = titleize(trainee.trainee.firstName);
        trainee.trainee.name = titleize(trainee.trainee.name);
        let region = regions.findRegionByCodeRegion(trainee.codeRegion);

        res.render('../../smtp/views/avis_injure.ejs', {
            trainee: trainee,
            comment: comment,
            consultationLink: `${configuration.app.public_hostname}/mail/${trainee.token}/injure?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`,
            unsubscribeLink: unsubscribeLink,
            formLink: formLink,
            moment: moment,
            email: getReplyToEmail(region),
            hostname: configuration.app.public_hostname,
            webView: true
        });
    });

    router.get('/mail/:token/alerte', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        const comment = await db.collection('comment').findOne({ token: req.params.token });

        const unsubscribeLink = mailer.getUnsubscribeLink(trainee);
        const formLink = mailer.getFormLink(trainee);
        trainee.trainee.firstName = titleize(trainee.trainee.firstName);
        trainee.trainee.name = titleize(trainee.trainee.name);
        let region = regions.findRegionByCodeRegion(trainee.codeRegion);

        res.render('../../smtp/views/avis_alerte.ejs', {
            trainee: trainee,
            comment: comment,
            consultationLink: `${configuration.app.public_hostname}/mail/${trainee.token}/alerte?utm_source=PE&utm_medium=mail&utm_campaign=${trainee.campaign}`,
            unsubscribeLink: unsubscribeLink,
            formLink: formLink,
            moment: moment,
            email: getReplyToEmail(region),
            hostname: configuration.app.public_hostname,
            webView: true
        });
    });

    router.get('/mail/:token/track', async (req, res) => {

        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        const trackRouteHandler = (collection, doc, found, response) => {
            if (found) {
                let trackingFieldName = doc.tracking && doc.tracking.firstRead ? 'lastRead' : 'firstRead';
                db.collection(collection).updateOne({ _id: doc._id }, {
                    $set: {
                        [`tracking.${trackingFieldName}`]: new Date()
                    }
                });
            }
            // serving a white 1x1 GIF
            let buf = new Buffer(35);
            buf.write('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
            response.send(buf, { 'Content-Type': 'image/gif' }, 200);
        };

        if (trainee !== null) {
            trackRouteHandler('trainee', trainee, true, res);
        } else {
            const organisme = await db.collection('accounts').findOne({ token: req.params.token });
            if (organisme !== null) {
                trackRouteHandler('organismes', organisme, true, res);
            } else {
                trackRouteHandler(null, null, false, res);
            }
        }
    });

    router.get('/mail/:token/unsubscribe', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });

        if (trainee === null) {
            res.status(404).render('errors/404');
            return;
        }

        db.collection('trainee').update({
            '_id': trainee._id
        }, {
            $set: {
                'unsubscribe': true
            }
        }, err => {
            if (err) {
                logger.error(err);
                res.status(500).render('errors/error');
            } else {
                res.render('front/mailing/unsubscribe.ejs', { trainee: trainee });
            }
        });
    });

    return router;
};
