const Joi = require('joi');
const express = require('express');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../routes-utils');

module.exports = ({ db, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');
    let checkProfile = middlewares.checkProfile('moderateur', 'financeur');

    router.get('/backoffice/organismes', checkAuth, checkProfile, tryAndCatch(async (req, res) => {

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

    router.get('/backoffice/organismes/:siren/formations', checkAuth, checkProfile, tryAndCatch(async (req, res) => {

        let { siren } = await Joi.validate(req.params, {
            siren: Joi.string().required(),
        }, { abortEarly: false });

        let stream = await db.collection('comment')
        .aggregate([
            {
                $match: {
                    'codeRegion': req.user.codeRegion,
                    'training.organisation.siret': new RegExp(`^${siren}`),
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
