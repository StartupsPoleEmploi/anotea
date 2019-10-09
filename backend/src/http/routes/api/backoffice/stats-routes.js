const Joi = require('joi');
const express = require('express');
const computeStagiairesStats = require('./utils/computeStagiairesStats');
const computeAvisStats = require('./utils/computeAvisStats');
const { tryAndCatch } = require('../../routes-utils');
const getQueries = require('./utils/getQueries');
const validators = require('./utils/validators');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let { buildAvisQuery, buildStagiaireQuery } = getQueries(db);

    router.get('/backoffice/stats/avis', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let region = regions.findRegionByCodeRegion(user.codeRegion);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(user, region),
        }, { abortEarly: false });

        let query = await buildAvisQuery(user, parameters);
        let results = await computeAvisStats(db, query);

        return res.json(results);
    }));

    router.get('/backoffice/stats/stagiaires', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let region = regions.findRegionByCodeRegion(user.codeRegion);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(user, region),
        }, { abortEarly: false });

        let query = await buildStagiaireQuery(user, parameters);
        let results = await computeStagiairesStats(db, query);

        return res.json(results);
    }));

    return router;
};
