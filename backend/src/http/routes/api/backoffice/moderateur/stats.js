
const express = require('express');
const { tryAndCatch } = require('../../../routes-utils');
const moderationStats = require('./utils/moderationStats');

module.exports = ({ db, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/backoffice/moderateur/stats', checkAuth, checkProfile('moderateur'), tryAndCatch(async (req, res) => {

        let codeRegion = req.user.codeRegion;
        let { computeStats } = moderationStats(db, codeRegion);

        res.json(await computeStats(db, codeRegion));
    }));

    return router;
};
