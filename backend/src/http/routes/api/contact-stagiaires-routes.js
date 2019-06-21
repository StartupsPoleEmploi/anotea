const express = require('express');
const Joi = require('joi');
const xss = require('xss');
const { tryAndCatch, sendJsonStream, sendCSVStream } = require('../routes-utils');

module.exports = ({ db, middlewares }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let { createBasicAuthMiddleware } = middlewares;
    let checkAuth = createBasicAuthMiddleware(['export']);

    router.post('/contact-stagiaires', tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.body, {
            question: Joi.string().required(),
            contact: Joi.string(),
            referrer: Joi.string(),
        }, { abortEarly: false });

        let doc = {
            question: xss(parameters.question),
            contact: xss(parameters.contact),
            referrer: xss(parameters.referrer),
        };

        await db.collection('contactStagiaires').insertOne(doc);

        res.json(doc);
    }));

    router.get('/contact-stagiaires', checkAuth, tryAndCatch(async (req, res) => {

        const { format } = await Joi.validate(req.query, {
            format: Joi.string().default('json'),
        }, { abortEarly: false });

        let columnNames = 'Contact;Question;Source\n';

        let stream = db.collection('contactStagiaires').find().stream();

        if (format === 'csv') {
            return sendCSVStream(stream, res, columnNames, doc => {
                return doc.contact + ';' +
                    doc.question + ';' +
                    doc.referrer + '\n';
            });
        } else {
            return sendJsonStream(stream, res);
        }
    }));

    return router;
};
