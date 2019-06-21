const express = require('express');
const Joi = require('joi');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ regions }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/regions', tryAndCatch(async (req, res) => {

        const parameters = await Joi.validate(req.query, {
            active: Joi.boolean().default(false),
        }, { abortEarly: false });

        res.json(parameters.active ? regions.findActiveRegions() : regions.getRegions());
    }));

    return router;
};
