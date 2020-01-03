const express = require('express');
const { tryAndCatch } = require('../../utils/routes-utils');

module.exports = ({ middlewares, regions }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware } = middlewares;
    let checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/departements', checkAuth, tryAndCatch(async (req, res) => {
        let region = regions.findRegionByCodeRegion(req.user.codeRegion);
        return res.json([...region.departements].sort((v1, v2) => {
            if (v1.label < v2.label) {
                return -1;
            }
            if (v1.label > v2.label) {
                return 1;
            }
            return 0;
        }));
    }));

    return router;
};
