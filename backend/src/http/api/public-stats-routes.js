const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const { tryAndCatch } = require('../utils/routes-utils');

module.exports = ({ db }) => {

    const router = express.Router(); // eslint-disable-line new-cap

    const getStats = async (type, fields, filters = {}) => {

        let res = await db.collection('statistics').aggregate([
            {
                $match: {
                    $and: [
                        ...(filters.debut ? [{ date: { $gte: moment(filters.debut).toDate() } }] : []),
                        ...(filters.fin ? [{ date: { $lte: moment(filters.fin).toDate() } }] : []),
                    ]
                },
            },
            {
                $project: {
                    date: 1,
                    [type]: 1,
                },
            },
            {
                $unwind: `$${type}`
            },
            {
                $group: {
                    _id: `$${type}.label`,
                    label: { $first: `$${type}.label` },
                    codeRegions: { $first: `$${type}.codeRegions` },
                    ...fields.reduce((acc, field) => {
                        return {
                            ...acc,
                            ...{ [field]: { $push: { value: `$${type}.${field}`, date: '$date' } } },
                        };
                    }, {}),
                },
            },
        ]).toArray();

        if (res.length === 0) {
            return {};
        }

        let national = res.find(r => r.label === 'Toutes');
        let regional = res.find(r => r.codeRegions.length === 1 && r.codeRegions.includes(filters.codeRegion));

        return {
            ...(filters.codeRegion ? { regional } : {}),
            national: Object.keys(national).reduce((acc, key) => {
                if (key.startsWith('nb')) {
                    acc[key] = national[key].map(({ date, value }) => {
                        let nbRegionsWithStats = res.length - 1;
                        return {
                            date,
                            value: Number(Math.round((value / nbRegionsWithStats) + 'e0') + 'e-0'),
                        };
                    });
                } else {
                    acc[key] = national[key];
                }

                return acc;
            }, {}),
        };
    };

    router.get('/api/stats', tryAndCatch(async (req, res) => {

        let parameters = await Joi.validate(req.query, {
            codeRegion: Joi.string(),
            debut: Joi.number().default(moment().subtract(1, 'months').startOf('month').subtract(1, 'days').valueOf()),
            fin: Joi.number().default(moment().valueOf()),
        }, { abortEarly: false });

        let results = await Promise.all([
            getStats('avis', [
                'nbStagiairesContactes',
                'nbQuestionnairesValidees',
                'nbAvisAvecCommentaire',
                'nbCommentairesPositifs',
                'nbCommentairesNegatifs',
                'nbCommentairesRejetes',
            ], parameters),
            getStats('organismes', ['organismesActifs', 'nbReponses'], parameters),
            getStats('api', ['nbSessions', 'nbAvis', 'nbAvisRestituables'], parameters),
        ]);

        res.json({
            avis: results[0],
            organismes: results[1],
            api: results[2],
        });
    }));

    return router;
};
