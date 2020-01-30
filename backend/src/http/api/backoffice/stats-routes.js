const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const computeStagiairesStats = require('./utils/computeStagiairesStats');
const computeAvisStats = require('./utils/computeAvisStats');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/stats', tryAndCatch(async (req, res) => {

        let firstStatsDate = moment('2019-08-01').valueOf();
        let now = moment().valueOf();

        let { codeRegion, debut, fin } = await Joi.validate(req.query, {
            codeRegion: Joi.string(),
            debut: Joi.number().min(firstStatsDate).max(now).default(firstStatsDate),
            fin: Joi.number().max(now).default(now),
        }, { abortEarly: false });

        let stream = await db.collection('statistics')
        .find({
            date: {
                $gte: moment(debut).toDate(),
                $lte: moment(fin).toDate(),
            }
        })
        .project({
            '_id': 0,
            'national.campagnes': 0,
        })
        .sort({ date: -1 })
        .transformStream({
            transform: ({ date, national, regions }) => {
                return {
                    date,
                    national,
                    ...(codeRegion ? { regional: regions[codeRegion] } : {}),
                };
            }
        });

        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'stats',
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
