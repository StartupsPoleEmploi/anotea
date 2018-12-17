module.exports = ({ db, logger, configuration }) => {

    const express = require('express');
    const moment = require('moment');
    const titleize = require('underscore.string/titleize');

    const mailer = require('../../components/mailer.js')(db, logger, configuration);

    const router = express.Router(); // eslint-disable-line new-cap

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
        let params = { trainee: trainee, unsubscribeLink: unsubscribeLink, formLink: formLink, moment: moment };

        const carif = await db.collection('carif').findOne({ codeRegion: trainee.codeRegion });
        if (carif === null) {
            res.status(404).render('errors/404');
        } else {
            params.carifName = carif.name;
            params.carifNameHidden = carif.carifNameHidden;
            params.carifEmail = carif.courriel ? carif.courriel : 'anotea@pole-emploi.fr';
            res.render('front/mailing/votre_avis.ejs', params);
        }
    });

    const trackRouteHandler = (collection, doc, found, response) => {
        const now = new Date();
        if (found) {
            if (doc.tracking === undefined) {
                doc.tracking = {
                    firstRead: now
                };
            } else {
                doc.tracking.lastRead = now;
            }
            db.collection(collection).save(doc);
        }
        // serving a white 1x1 GIF
        let buf = new Buffer(35);
        buf.write('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
        response.send(buf, { 'Content-Type': 'image/gif' }, 200);
    };

    router.get('/mail/:token/track', async (req, res) => {
        const trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (trainee !== null) {
            trackRouteHandler('trainee', trainee, true, res);
        } else {
            const organisme = await db.collection('organismes').findOne({ token: req.params.token });
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
        }, (err, doc) => {
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
