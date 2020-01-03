const Joi = require('joi');
const express = require('express');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');

module.exports = ({ db, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');

    router.get('/api/backoffice/formations', checkAuth, tryAndCatch(async (req, res) => {

        let { organisme } = await Joi.validate(req.query, {
            organisme: Joi.string().min(9).max(15),
        }, { abortEarly: false });

        let stream = await db.collection('comment')
        .aggregate([
            {
                $match: {
                    'codeRegion': req.user.codeRegion,
                    ...(organisme ? { 'training.organisation.siret': new RegExp(`^${organisme}`) } : {}),
                }
            },
            {
                $group: {
                    _id: '$training.idFormation',
                    idFormation: { $first: '$training.idFormation' },
                    title: { $first: '$training.title' },
                    nbAvis: { $sum: 1 }
                }
            },
            {
                $sort: {
                    titre: 1
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
