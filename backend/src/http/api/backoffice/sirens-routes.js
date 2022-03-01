const express = require('express');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');
const getProfile = require('./profiles/getProfile');

module.exports = ({ db, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/sirens', checkAuth, tryAndCatch(async (req, res) => {

        

        const stream = await db.collection('avis')
        .aggregate([
            {
                $match: {
                    codeRegion: req.user.profile !== 'admin' ? req.user.codeRegion : {$exists: true},
                }
            },
            {
                $group: {
                    _id: { $substr: ['$formation.action.organisme_formateur.siret', 0, 9] },
                    siren: { $first: { $substr: ['$formation.action.organisme_formateur.siret', 0, 9] } },
                    name: { $first: '$formation.action.organisme_formateur.raison_sociale' },
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
