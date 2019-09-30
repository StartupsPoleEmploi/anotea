const Joi = require('joi');
const express = require('express');
const computeStagiairesStats = require('./computeStagiairesStats');
const computeModerationStats = require('./computeModerationStats');
const computeAvisStats = require('./computeAvisStats');
const { tryAndCatch } = require('../../../routes-utils');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');
    let validators = require('../utils/validators')(regions);
    let queries = require('../utils/searchQueries')(db);

    router.get('/backoffice/stats/stagiaires', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let parameters = await Joi.validate(req.query, {
            ...validators.form(user),
        }, { abortEarly: false });

        let query = await queries.form(user, parameters);
        let results = await computeStagiairesStats(db, query);

        return res.json(results);
    }));

    router.get('/backoffice/stats/avis', checkAuth, tryAndCatch(async (req, res) => {

        let user = req.user;
        let parameters = await Joi.validate(req.query, {
            ...validators.form(user),
        }, { abortEarly: false });

        let results = await computeAvisStats(db, {
            ...await queries.form(user, parameters),
            ...queries.archived(user),
        });

        return res.json(results);
    }));

    router.get('/backoffice/stats/moderation', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let user = req.user;
        let parameters = await Joi.validate(req.query, {
            ...validators.form(user),
            ...(user.profile !== 'financeur' ? { archived: false } : {}),
        }, { abortEarly: false });

        let query = await queries.form(user, parameters);
        res.json(await computeModerationStats(db, query));
    }));

    return router;
};
