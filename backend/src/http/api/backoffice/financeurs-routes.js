const express = require('express');
const { tryAndCatch } = require('../../utils/routes-utils');
const { getFinanceurs } = require('../../../core/utils/financeurs');

module.exports = ({ middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/financeurs', checkAuth, tryAndCatch(async (req, res) => {
        return res.json(getFinanceurs());
    }));

    return router;
};
