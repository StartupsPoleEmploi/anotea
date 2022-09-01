const express = require('express');
const { boomify } = require('boom');

module.exports = ({ middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createHMACAuthMiddleware } = middlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: false });

    router.get('/api/v1/ping/anonymous', (req, res) => res.json({ user: 'anonymous' }));

    router.get('/api/v1/ping/authenticated', checkAuth, (req, res) => res.json({ user: req.user }));

    router.post('/api/v1/ping/authenticated', checkAuth, (req, res) => res.json({ user: req.user }));

    router.get('/api/v1/ping/error', (req, res, next) => {
        let { statusCode } = Joi.validate(req.query, {
            statusCode: Joi.number(),
        }, { abortEarly: false });
        let error = boomify(new Error('ping error'), { statusCode: statusCode });
        next(error);
    });

    return router;
};
