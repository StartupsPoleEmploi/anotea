const express = require('express');
const Joi = require('joi');
const xss = require('xss');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

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

    return router;
};
