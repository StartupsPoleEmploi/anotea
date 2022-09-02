const express = require('express');
const Joi = require('joi');
const { sendHTML } = require('../utils/routes-utils');

module.exports = ({ db, logger, emails }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    let send404 = res => {
        return res.status(404).render('errors/404');
    };

    let sendTrackingImage = res => {
        // serving a white 1x1 GIF
        let buf = new Buffer(35);
        buf.write('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
        return res.send(buf, { 'Content-Type': 'image/gif' }, 200);
    };

    router.get('/emails/:type/:token/templates/:templateName', async (req, res) => {

        const parameters = await Joi.validate(Object.assign({}, req.params, req.query), {
            type: Joi.string().valid(['organismes', 'stagiaires']).required(),
            token: Joi.string().required(),
            templateName: Joi.string().required(),
            avis: Joi.string(),
        }, { abortEarly: false });

        let doc = await db.collection(parameters.type === 'organismes' ? 'accounts' : 'stagiaires').findOne({
            token: parameters.token
        });
        if (!doc) {
            return send404(res);
        }

        let avis = parameters.avis ? await db.collection('avis').findOne({ token: parameters.avis }) : null;
        let message = emails.getEmailMessageByTemplateName(parameters.templateName);
        let html = await message.render(doc, avis);

        return sendHTML(res, html);
    });

    router.get('/emails/organismes/:token/track', async (req, res) => {
        try {
            let { token } = await Joi.validate(req.params, {
                token: Joi.string().required(),
            }, { abortEarly: false });


            let organisme = await db.collection('accounts').findOne({ token });
            if (organisme) {
                let trackingFieldName = organisme.tracking && organisme.tracking.firstRead ? 'lastRead' : 'firstRead';
                db.collection('accounts').updateOne({ token }, {
                    $set: {
                        [`tracking.${trackingFieldName}`]: new Date()
                    }
                });
            }

            return sendTrackingImage(res);
        } catch (e) {
            return send404(res);
        }
    });

    router.get('/emails/stagiaires/:token/track', async (req, res) => {
        try {
            let { token } = await Joi.validate(req.params, {
                token: Joi.string().required(),
            }, { abortEarly: false });

        
            let stagiaire = await db.collection('stagiaires').findOne({ token });
            if (stagiaire) {
                let trackingFieldName = stagiaire.tracking && stagiaire.tracking.firstRead ? 'lastRead' : 'firstRead';
                db.collection('stagiaires').updateOne({ token }, {
                    $set: {
                        [`tracking.${trackingFieldName}`]: new Date()
                    }
                });
            }

            return sendTrackingImage(res);
        } catch(e) {
            return res.status(500).send();
        }
    });

    router.get('/emails/stagiaires/:token/unsubscribe', async (req, res) => {
        try {
            let { token } = await Joi.validate(req.params, {
                token: Joi.string().required(),
            }, { abortEarly: false });
            let stagiaire = await db.collection('stagiaires').findOne({ token: token });
            if (!stagiaire) {
                return send404(res);
            }
            await db.collection('stagiaires').update({ '_id': stagiaire._id }, {
                $set: {
                    'unsubscribe': true
                }
            });
            return res.render('unsubscribe');
        } catch (e) {
            logger.error(e);
            return res.status(500).render('errors/error');
        }
    });

    return router;
};
