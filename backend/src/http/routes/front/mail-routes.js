const express = require('express');
const Joi = require('joi');

module.exports = ({ db, logger, emails }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    let sendHTML = (res, html) => {
        res.set('Content-Type', 'text/html');
        res.send(new Buffer(html));
    };

    let send404 = res => {
        return res.status(404).render('errors/404');
    };

    let sendTrackingImage = res => {
        // serving a white 1x1 GIF
        let buf = new Buffer(35);
        buf.write('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
        return res.send(buf, { 'Content-Type': 'image/gif' }, 200);
    };

    router.get('/mail/:type/:token/templates/:templateName', async (req, res) => {

        const { type, token, templateName } = await Joi.validate(req.params, {
            type: Joi.string().valid(['organismes', 'stagiaires']).required(),
            token: Joi.string().required(),
            templateName: Joi.string().required(),
        }, { abortEarly: false });

        let doc = await db.collection(type === 'organismes' ? 'accounts' : 'trainee').findOne({ token });
        if (!doc) {
            return send404(res);
        }

        let message = emails.getEmailMessageByTemplateName(templateName);
        let { html } = await message.render(doc);

        return sendHTML(res, html);
    });


    router.get('/mail/organismes/:token/track', async (req, res) => {
        let token = req.params.token;
        const organisme = await db.collection('accounts').findOne({ token });
        if (organisme) {
            let trackingFieldName = organisme.tracking && organisme.tracking.firstRead ? 'lastRead' : 'firstRead';
            db.collection('accounts').updateOne({ token }, {
                $set: {
                    [`tracking.${trackingFieldName}`]: new Date()
                }
            });
        }

        return sendTrackingImage(res);
    });

    router.get('/mail/stagiaires/:token/track', async (req, res) => {
        let token = req.params.token;

        let trainee = await db.collection('trainee').findOne({ token });
        if (trainee) {
            let trackingFieldName = trainee.tracking && trainee.tracking.firstRead ? 'lastRead' : 'firstRead';
            db.collection('trainee').updateOne({ token }, {
                $set: {
                    [`tracking.${trackingFieldName}`]: new Date()
                }
            });
        }

        return sendTrackingImage(res);
    });

    router.get('/mail/stagiaires/:token/unsubscribe', async (req, res) => {
        let trainee = await db.collection('trainee').findOne({ token: req.params.token });

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
