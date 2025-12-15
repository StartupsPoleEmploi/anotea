const express = require('express');
const Joi = require('joi');
const { tryAndCatch } = require('../../utils/routes-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/stagiaires/stats', checkAuth, tryAndCatch(async (req, res) => {
        let { validators, queries } = getProfile(db, regions, req.user);
        const schema = Joi.object({
            ...validators.form(),
        });
        let parameters = Joi.attempt(req.query, schema, '', { abortEarly: false });

        let results = await db.collection('stagiaires').aggregate([
            {
                $match: await queries.buildStagiaireQuery(parameters)
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    nbEmailsEnvoyes: { $sum: { $cond: [{ $ne: ['$mailSentDate', null] }, 1, 0] } },
                }
            },
            {
                $project: {
                    _id: 0,
                }
            }
        ]).toArray();

        return res.json(results.length === 0 ? {} : results[0]);
    }));

    return router;
};
