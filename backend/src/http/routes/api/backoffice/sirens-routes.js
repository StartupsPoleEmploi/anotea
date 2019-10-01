const express = require('express');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../routes-utils');

module.exports = ({ db, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');

    router.get('/backoffice/sirens', checkAuth, tryAndCatch(async (req, res) => {

        const stream = await db.collection('comment')
        .aggregate([
            {
                $match: {
                    codeRegion: req.user.codeRegion,
                }
            },
            {
                $group: {
                    _id: { $substr: ['$training.organisation.siret', 0, 9] },
                    siren: { $first: { $substr: ['$training.organisation.siret', 0, 9] } },
                    name: { $first: '$training.organisation.name' },
                    nbAvis: { $sum: 1 }
                }
            },
            {
                $sort: {
                    name: 1
                }
            },
            {
                $project: {
                    _id: 0,
                }
            }
        ])
        .stream();

        return sendArrayAsJsonStream(stream, res);
    }));

    return router;
};
