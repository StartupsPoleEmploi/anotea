const express = require('express');
const Joi = require('joi');
const { sendHTML } = require('../utils/routes-utils');

module.exports = ({ db, logger, emails }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    let send404 = res => {
        return res.status(404).render('errors/404');
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
