const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');
module.exports = ({ db }) => {
    let router = express.Router(); // eslint-disable-line new-cap

    const firstStatDate = '01-08-2019';
    const requestStatsSchema = Joi.object({
        codeRegion: Joi.string(),
        debut: Joi.date().timestamp().min(firstStatDate).max('now').default(new Date(firstStatDate)),
        fin: Joi.date().timestamp().min(firstStatDate).default(Date.now),
    });

    router.get('/api/backoffice/stats', tryAndCatch(async (req, res) => {
        let { codeRegion, debut, fin } = Joi.attempt(req.query, requestStatsSchema, '', { abortEarly: false });

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
        .map(({ date, national, regions }) => {
                return {
                    date,
                    national,
                    ...(codeRegion ? { regional: regions[codeRegion] } : {}),
                };
            }
        ).stream();
        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'stats',
        });
    }));
    return router;
};
