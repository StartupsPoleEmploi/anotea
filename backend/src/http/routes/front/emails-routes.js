const express = require('express');
const Joi = require('joi');
const { sendHTML } = require('../routes-utils');
const createTemplateUtils = require('../../../common/components/emails/createTemplateUtils');

module.exports = ({ db, logger, emails, configuration, regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let utils = createTemplateUtils(configuration, regions);

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

        const { type, token, templateName, avis } = await Joi.validate(Object.assign({}, req.params, req.query), {
            type: Joi.string().valid(['organismes', 'stagiaires']).required(),
            token: Joi.string().required(),
            templateName: Joi.string().required(),
            avis: Joi.string(),
        }, { abortEarly: false });

        let doc = await db.collection(type === 'organismes' ? 'accounts' : 'trainee').findOne({ token });
        if (!doc) {
            return send404(res);
        }

        let comment = avis ? await db.collection('comment').findOne({ token: avis }) : null;
        let message = emails.getEmailMessageByTemplateName(templateName);
        let html = await message.render(doc, comment);

        return sendHTML(res, html);
    });

    router.get('/emails/organismes/:token/track', async (req, res) => {
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

    router.get('/emails/stagiaires/:token/track', async (req, res) => {
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

    router.get('/emails/stagiaires/:token/unsubscribe', async (req, res) => {
        let trainee = await db.collection('trainee').findOne({ token: req.params.token });
        if (!trainee) {
            return send404(res);
        }

        try {
            await db.collection('trainee').update({ '_id': trainee._id }, {
                $set: {
                    'unsubscribe': true
                }
            });
            return res.render('front/unsubscribe');
        } catch (e) {
            logger.error(e);
            return res.status(500).render('errors/error');
        }
    });

    return router;
};
