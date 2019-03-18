const express = require('express');
const { tryAndCatch } = require('../routes-utils');

module.exports = ({ db, middlewares }) => {

    const router = express.Router(); // eslint-disable-line new-cap
    let { createJWTAuthMiddleware, checkProfile } = middlewares;
    const checkAuth = createJWTAuthMiddleware('backoffice');

    router.get('/backoffice/financeur/region/:idregion/mailStats/:year/months', checkAuth, checkProfile('financeur'), tryAndCatch(async (req, res) => {

        let codeFinanceur = req.query.codeFinanceur;

        let match = { '_id.codeRegion': req.params.idregion };
        if (req.params.year !== 'TOTAL') {
            match = Object.assign(match, { '_id.year': parseInt(req.params.year) });
        }
        let mailStatsCollection;
        let sessionsStatsCollection;
        if (codeFinanceur) {
            match = Object.assign(match, { '_id.codeFinanceur': codeFinanceur });
            mailStatsCollection = 'mailStatsByCodeFinanceur';
            sessionsStatsCollection = 'sessionsStatsByCodeFinanceur';
        } else {
            mailStatsCollection = 'mailStats';
            sessionsStatsCollection = 'sessionsStats';
        }

        let results = Array.from(Array(12).keys()).map(i => {
            return {
                _id: i + 1,
                count: 0,
                countEmailOpen: 0,
                countAdvicesPublished: 0,
                countAdvicesWithComments: 0,
                countAdvicesPositif: 0,
                countAdvicesNegatif: 0,
                countAdvicesRejected: 0,
                countSession: 0,
                countSessionWithAdvices: 0,
                countSessionWithMoreThanTwoAdvices: 0,
                countOrganisme: 0,
                countOrganismeAccountCreated: 0,
                countOrganismeWithMorethanOneAdvice: 0,
                countOrganismeLogin: 0
            };
        });

        let stats = await db.collection(mailStatsCollection).aggregate([
            {
                $match:
                match
            },
            {
                $group:
                    {
                        _id: '$_id.month',
                        count: { $sum: '$count' },
                        countEmailOpen: { $sum: '$countEmailOpen' },
                        countAdvicesPublished: { $sum: '$countAdvicesPublished' },
                        countAdvicesWithComments: { $sum: '$countAdvicesWithComments' },
                        countAdvicesPositif: { $sum: '$countAdvicesPositif' },
                        countAdvicesNegatif: { $sum: '$countAdvicesNegatif' },
                        countAdvicesRejected: { $sum: '$countAdvicesRejected' }
                    }
            }
        ]).toArray();

        stats.forEach(item => {
            results[item._id - 1] = item;
        });

        let sessionStats = await db.collection(sessionsStatsCollection).find(match).toArray();

        sessionStats.forEach(item => {
            results[item._id.month - 1].countSession = item.count;
            results[item._id.month - 1].countSessionWithAdvices = item.countWithAdvices;
            results[item._id.month - 1].countSessionWithMoreThanTwoAdvices = item.countWithMoreThanTwoAdvices;
        });

        let organismesStats = await db.collection('organismesStats').find(match).toArray();

        organismesStats.forEach(item => {
            results[item._id.month - 1].countOrganisme = item.count;
            results[item._id.month - 1].countOrganismeAccountCreated = item.countAccountCreated;
            results[item._id.month - 1].countOrganismeWithMorethanOneAdvice = item.countWithMorethanOneAdvice;
            results[item._id.month - 1].countOrganismeLogin = item.countLogin;
        });

        res.status(200).send(results);
    }));

    router.get('/backoffice/financeur/region/:idregion/mailStats/:year', checkAuth, tryAndCatch(async (req, res) => {

        let codeFinanceur = req.query.codeFinanceur;

        let match = { '_id.codeRegion': req.params.idregion };
        if (req.params.year !== 'TOTAL') {
            match = Object.assign(match, { '_id.year': parseInt(req.params.year) });
        }
        let mailStatsCollection;
        let sessionsStatsCollection;
        if (codeFinanceur) {
            match = Object.assign(match, { '_id.codeFinanceur': codeFinanceur });
            mailStatsCollection = 'mailStatsByCodeFinanceur';
            sessionsStatsCollection = 'sessionsStatsByCodeFinanceur';
        } else {
            mailStatsCollection = 'mailStats';
            sessionsStatsCollection = 'sessionsStats';
        }

        let stats = await db.collection(mailStatsCollection).aggregate([
            {
                $match:
                match
            },
            {
                $group:
                    {
                        _id: null,
                        count: { $sum: '$count' },
                        countEmailOpen: { $sum: '$countEmailOpen' },
                        countAdvicesPublished: { $sum: '$countAdvicesPublished' },
                        countAdvicesWithComments: { $sum: '$countAdvicesWithComments' },
                        countAdvicesPositif: { $sum: '$countAdvicesPositif' },
                        countAdvicesNegatif: { $sum: '$countAdvicesNegatif' },
                        countAdvicesRejected: { $sum: '$countAdvicesRejected' }
                    }
            }
        ]).toArray();


        let organismesStats = await db.collection('organismesStats').aggregate([
            {
                $match:
                match
            },
            {
                $group:
                    {
                        _id: null,
                        countOrganisme: { $sum: '$count' },
                        countOrganismeAccountCreated: { $sum: '$countAccountCreated' },
                        countOrganismeWithMorethanOneAdvice: { $sum: '$countWithMorethanOneAdvice' },
                        countOrganismeLogin: { $sum: '$countLogin' }
                    }
            }
        ]).toArray();

        let sessionsStats = await db.collection(sessionsStatsCollection).aggregate([
            {
                $match:
                match
            },
            {
                $group:
                    {
                        _id: null,
                        countSessions: { $sum: '$count' },
                        countSessionsWithAdvices: { $sum: '$countWithAdvices' },
                        countSessionsWithMoreThanTwoAdvices: { $sum: '$countWithMoreThanTwoAdvices' }
                    }
            }
        ]).toArray();

        let obj = {
            count: 0,
            countEmailOpen: 0,
            countAdvicesPublished: 0,
            countAdvicesWithComments: 0,
            countAdvicesPositif: 0,
            countAdvicesNegatif: 0,
            countAdvicesRejected: 0,
            countSessions: 0,
            countSessionsWithAdvices: 0,
            countSessionsWithMoreThanTwoAdvices: 0,
            countOrganisme: 0,
            countOrganismeAccountCreated: 0,
            countOrganismeWithMorethanOneAdvice: 0,
            countOrganismeLogin: 0
        };

        if (stats.length > 0) {
            obj = Object.assign(obj, stats[0]);
        }

        if (organismesStats.length > 0) {
            obj = Object.assign(obj, organismesStats[0]);
        }

        if (sessionsStats.length > 0) {
            obj = Object.assign(obj, sessionsStats[0]);
        }
        delete obj._id;

        res.status(200).send(obj);
    }));

    return router;
};
