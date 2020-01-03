const Joi = require('joi');
const express = require('express');
const computeStagiairesStats = require('./utils/computeStagiairesStats');
const computeAvisStats = require('./utils/computeAvisStats');
const { tryAndCatch } = require('../../utils/routes-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/stats/avis', checkAuth, tryAndCatch(async (req, res) => {

        let { validators, queries } = getProfile(db, regions, req.user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
        }, { abortEarly: false });

        let query = await queries.buildAvisQuery(parameters);
        let results = await computeAvisStats(db, query);

        return res.json(results);
    }));

    router.get('/api/backoffice/stats/stagiaires', checkAuth, tryAndCatch(async (req, res) => {

        let { validators, queries } = getProfile(db, regions, req.user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
        }, { abortEarly: false });

        let query = await queries.buildStagiaireQuery(parameters);
        let results = await computeStagiairesStats(db, query);

        return res.json(results);
    }));

    return router;
};
