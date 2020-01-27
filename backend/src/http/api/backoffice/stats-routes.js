const express = require('express');
const Joi = require('joi');
const moment = require('moment');
const computeStagiairesStats = require('./utils/computeStagiairesStats');
const computeAvisStats = require('./utils/computeAvisStats');
const computePublicStats = require('./utils/computePublicStats');
const { tryAndCatch } = require('../../utils/routes-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/stats', tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.query, {
            codeRegion: Joi.string(),
            debut: Joi.number().default(moment().subtract(1, 'months').startOf('month').subtract(1, 'days').valueOf()),
            fin: Joi.number().default(moment().valueOf()),
        }, { abortEarly: false });

        let results = await Promise.all([
            computePublicStats(db, 'avis', [
                'nbStagiairesContactes',
                'nbQuestionnairesValidees',
                'nbAvisAvecCommentaire',
                'nbCommentairesPositifs',
                'nbCommentairesNegatifs',
                'nbCommentairesRejetes',
            ], parameters),
            computePublicStats(db, 'organismes', ['organismesActifs', 'nbReponses'], parameters),
            computePublicStats(db, 'api', ['nbSessions', 'nbAvis', 'nbAvisRestituables'], parameters),
        ]);

        res.json({
            avis: results[0],
            organismes: results[1],
            api: results[2],
        });
    }));

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
