const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');
module.exports = ({ db }) => {
    let router = express.Router(); // eslint-disable-line new-cap
    router.get('/api/backoffice/stats', tryAndCatch(async (req, res) => {
        let firstStatsDate = moment('2019-08-01').valueOf();
        let debutParam = moment('2024-01-30').valueOf();
        let finParam = moment('2029-06-13').valueOf();
        let now = moment().valueOf();
        let { codeRegion, debut, fin } = await Joi.validate(req.query, {
            codeRegion: Joi.string(),
            debut: Joi.number().min(debutParam).max(now).default(firstStatsDate),
            fin: Joi.number().min(finParam).default(now),
        }, { abortEarly: false });

        let stream = await db.collection('statistics')
        .find({
            date: {
                $gte: moment(debut).toDate(),
                $lte: moment(fin).toDate(),
            }
        })
        .sort({ date: -1 })
        .project({
            '_id': 0,
            'national.campagnes': 0,
        })
        .transformStream({
            transform: ({ date, national, regions }) => {
                return {
                    date,
                    national,
                    ...(codeRegion ? { regional: regions[codeRegion] } : {}),
                };
            }
        });
        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'stats',
        });
    }));
    return router;
};
