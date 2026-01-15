const express = require('express');
const Joi = require('joi');
const { sendHTML } = require('../utils/routes-utils');
const { tokenSchema } = require('../utils/validators-utils');

module.exports = ({ db, logger, emails }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    let send404 = res => {
        return res.status(404).render('errors/404');
    };

    const unsubSchema = Joi.object({
        type: Joi.string().valid('organismes', 'stagiaires').required(),
        token: Joi.string().required(),
        templateName: Joi.string().required(),
        avis: Joi.string(),
    });

    router.get('/emails/:type/:token/templates/:templateName', async (req, res) => {

        const parameters = Joi.attempt(Object.assign({}, req.params, req.query), unsubSchema, '', { abortEarly: false });

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
            let { token } = Joi.attempt(req.params, tokenSchema, '', { abortEarly: false });
            let stagiaire = await db.collection('stagiaires').findOne({ token: token });
            if (!stagiaire) {
                return send404(res);
            }
            await db.collection('stagiaires').updateOne({ '_id': stagiaire._id }, {
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
