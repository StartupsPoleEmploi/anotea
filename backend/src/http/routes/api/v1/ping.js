const express = require('express');
const { boomify } = require('boom');

module.exports = ({ authMiddlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createHMACAuthMiddleware } = authMiddlewares;
    let checkAuth = createHMACAuthMiddleware(['esd', 'maformation'], { allowNonAuthenticatedRequests: false });

    router.get('/v1/ping/anonymous', (req, res) => res.json({ user: 'anonymous' }));

    router.get('/v1/ping/authenticated', checkAuth, (req, res) => res.json({ user: req.user }));

    router.post('/v1/ping/authenticated', checkAuth, (req, res) => res.json({ user: req.user }));

    router.get('/v1/ping/error', (req, res, next) => {
        let error = boomify(new Error('ping error'), { statusCode: req.query.http_code });
        next(error);
    });

    return router;
};
