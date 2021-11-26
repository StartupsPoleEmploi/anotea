const express = require('express');
const moment = require('moment');
const Joi = require('joi');
const { tryAndCatch, sendArrayAsJsonStream } = require('../../utils/routes-utils');

module.exports = ({ db }) => {

    let router = express.Router(); // eslint-disable-line new-cap

    router.get('/api/backoffice/stats', tryAndCatch(async (req, res) => {

        let firstStatsDate = moment('2019-08-01').valueOf();
        let now = moment().valueOf();

        let { codeRegion, debut, fin } = await Joi.validate(req.query, {
            codeRegion: Joi.string(),
            debut: Joi.number().min(firstStatsDate).max(now).default(firstStatsDate),
            fin: Joi.number().min(firstStatsDate).default(now),
        }, { abortEarly: false });

        let stream = await db.collection('statistics')
        .find({
            $and: [
                {
                    date: {
                        $gte: moment(debut).toDate()
                    }
                },
                {
                    date: {
                        $lte: moment(fin).toDate(),
                    }
                },
            ]
        })
        .sort({ date: -1 })
        .transformStream({
            transform: ({ date, national, regions }) => {
                delete national.campagnes;
                return {
                    date,
                    national,
                    ...(codeRegion ? { regional: regions[codeRegion] } : {}),
                };
            }
        });

        /*
2021-11-26T16:36:49.988+0000 W  QUERY    [conn4591] Plan executor error during find command: FAILURE, status: OperationFailed: Sort operation used more than the maximum 33554432 bytes of RAM. Add an index, or specify a smaller limit., stats: { stage: "PROJECTION_DEFAULT", nReturned: 0, executionTimeMillisEstimate: 23, works: 568, advanced: 0, needTime: 567, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, transformBy: { _id: 0, national.campagnes: 0 }, inputStage: { stage: "SORT", nReturned: 0, executionTimeMillisEstimate: 23, works: 568, advanced: 0, needTime: 567, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, sortPattern: { date: -1 }, memUsage: 33639696, memLimit: 33554432, inputStage: { stage: "SORT_KEY_GENERATOR", nReturned: 554, executionTimeMillisEstimate: 23, works: 567, advanced: 554, needTime: 13, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, inputStage: { stage: "COLLSCAN", filter: { $and: [ { date: { $lte: new Date(1637944609955) } }, { date: { $gte: new Date(1564617600000) } } ] }, nReturned: 554, executionTimeMillisEstimate: 23, works: 566, advanced: 554, needTime: 12, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, direction: "forward", docsExamined: 565 } } } }
2021-11-26T16:39:44.092+0000 W  QUERY    [conn4592] Plan executor error during find command: FAILURE, status: OperationFailed: Sort operation used more than the maximum 33554432 bytes of RAM. Add an index, or specify a smaller limit., stats: { stage: "PROJECTION_DEFAULT", nReturned: 0, executionTimeMillisEstimate: 23, works: 568, advanced: 0, needTime: 567, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, transformBy: { _id: 0, national.campagnes: 0 }, inputStage: { stage: "SORT", nReturned: 0, executionTimeMillisEstimate: 23, works: 568, advanced: 0, needTime: 567, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, sortPattern: { date: -1 }, memUsage: 33639696, memLimit: 33554432, inputStage: { stage: "SORT_KEY_GENERATOR", nReturned: 554, executionTimeMillisEstimate: 19, works: 567, advanced: 554, needTime: 13, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, inputStage: { stage: "COLLSCAN", filter: { $and: [ { date: { $lte: new Date(1637944784054) } }, { date: { $gte: new Date(1564617600000) } } ] }, nReturned: 554, executionTimeMillisEstimate: 19, works: 566, advanced: 554, needTime: 12, needYield: 0, saveState: 4, restoreState: 4, isEOF: 0, direction: "forward", docsExamined: 565 } } } }
        */

        return sendArrayAsJsonStream(stream, res, {
            arrayPropertyName: 'stats',
        });
    }));

    return router;
};
