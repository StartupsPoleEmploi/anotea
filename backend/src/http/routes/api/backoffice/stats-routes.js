const Joi = require('joi');
const express = require('express');
const computeStagiairesStats = require('./stats/computeStagiairesStats');
const computeModerationStats = require('./stats/computeModerationStats');
const computeAvisStats = require('./stats/computeAvisStats');
const { tryAndCatch } = require('../../routes-utils');
const avisQueryFactory = require('./avis/avisQueryFactory');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/backoffice/stats/stagiaires', checkAuth, tryAndCatch(async (req, res) => {

        let { validators, queries } = avisQueryFactory(db, req.user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
        }, { abortEarly: false });

        let query = await queries.form(parameters);
        let results = await computeStagiairesStats(db, query);

        return res.json(results);
    }));

    router.get('/backoffice/stats/avis', checkAuth, tryAndCatch(async (req, res) => {

        let { validators, queries } = avisQueryFactory(db, req.user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
        }, { abortEarly: false });

        let results = await computeAvisStats(db, {
            ...await queries.form(parameters),
        });

        return res.json(results);
    }));

    router.get('/backoffice/stats/moderation', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let { validators, queries } = avisQueryFactory(db, req.user);
        let parameters = await Joi.validate(req.query, {
            ...validators.form(),
        }, { abortEarly: false });

        res.json(await computeModerationStats(db, {
            ...await queries.form(parameters),
        }));
    }));

    return router;
};