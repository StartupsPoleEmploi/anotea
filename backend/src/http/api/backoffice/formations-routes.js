const Joi = require('joi');
const express = require('express');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');
const { checkSiret } = require('../../utils/validators-utils');

module.exports = ({ db, middlewares }) => {

    let router = express.Router(); // eslint-disable-line new-cap
    let checkAuth = middlewares.createJWTAuthMiddleware('backoffice');

    const searchOrganismeSchema = Joi.object({
        organisme: checkSiret(),
    });

    router.get('/api/backoffice/formations', checkAuth, tryAndCatch(async (req, res) => {

        let { organisme } = Joi.attempt(req.query, searchOrganismeSchema, '', { abortEarly: false });

        let stream = await db.collection('avis')
        .aggregate([
            {
                $match: {
                    'codeRegion': req.user.profile !== 'admin' ? req.user.codeRegion : {$exists: true},
                    ...(organisme ? { 'formation.action.organisme_formateur.siret': new RegExp(`^${organisme}`) } : {}),
                    'formation.numero': { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$formation.numero',
                    numeroFormation: { $first: '$formation.numero' },
                    title: { $first: '$formation.intitule' },
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
